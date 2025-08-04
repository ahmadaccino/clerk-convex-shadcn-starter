/* eslint-disable max-lines */
import Decimal from "decimal.js";

type Compounded = "daily" | "monthly" | "yearly";

interface StudentLoanIn {
  _id: string;
  _creationTime: number;
  compounded: Compounded;
  nickname: string;
  issuer: string;
  balance: number;
  apr: number; // percent, e.g. 12 means 12%
  minimumPayment: number;
}

interface CreditCardIn {
  _id: string;
  _creationTime: number;
  compounded: Compounded;
  nickname: string;
  issuer: string;
  balance: number;
  apr: number; // percent
  has_intro_promotion: boolean;
  intro_apr: number; // percent
  intro_expiration_timestamp: number; // ms
  credit_limit: number;
  can_send_balance_transfer: boolean;
  can_recieve_balance_transfer: boolean;
  balance_transfer_fee: number; // percent if is_balance_transfer_fee_fixed=true; else fixed dollars
  is_balance_transfer_fee_fixed: boolean;
}

interface InitialTransfer {
  from: string;
  to: string;
  amount: number;
  fee: number;
}
interface AccountBalances {
  [accountId: string]: number;
}
interface MonthlyScheduleEntry {
  month: number;
  balance_start: AccountBalances;
  interest: AccountBalances;
  payments: AccountBalances;
  balance_end: AccountBalances;
}

interface DebtRepaymentPlan {
  initial_transfers: InitialTransfer[];
  monthly_schedule: MonthlyScheduleEntry[];
  months_to_payoff: number;
  total_interest_paid: number;
}

type DebtType = "loan" | "card";

interface Debt {
  id: string;
  type: DebtType;
  compounded: Compounded;
  balance: Decimal;
  aprAnnualPct: Decimal; // input APR percent for baseline
  // credit-card extras
  hasIntro?: boolean;
  introAprPct?: Decimal;
  introExpTs?: number;
  creditLimit?: Decimal;
  // operational
  minimumPayment: Decimal; // for cards we’ll compute 1% or $25 min equivalent
  issuer: string;
  nickname: string;
}

function pctToDecimal(pct: number): Decimal {
  return new Decimal(pct).div(100);
}

function getCompoundingFrequency(compounded: Compounded): number {
  switch (compounded) {
    case "daily":
      return 365;
    case "monthly":
      return 12;
    case "yearly":
      return 1;
  }
}

function monthlyRateForDebt(d: Debt, nowTs: number): Decimal {
  // Determine effective APR for this month (intro if applicable)
  let aprPct = d.aprAnnualPct;
  if (d.type === "card" && d.hasIntro && typeof d.introExpTs === "number") {
    if (nowTs <= (d.introExpTs ?? 0)) {
      aprPct = d.introAprPct ?? aprPct;
    }
  }
  const apr = aprPct; // already decimal, e.g. 0.12
  if (d.compounded === "daily") {
    // Convert nominal APR to effective monthly via daily comp
    // EIR_month = (1 + APR/365)^(days_in_cycle) - 1; we’ll use 30-day cycle
    const daily = apr.div(365);
    return Decimal.pow(Decimal.add(1, daily), 30).minus(1);
  }
  if (d.compounded === "monthly" || d.compounded === "yearly") {
    // Use nominal APR / 12 as monthly nominal approximation
    return apr.div(12);
  }
  return apr.div(12);
}

function estimateMonthlyInterest(d: Debt, nowTs: number): Decimal {
  if (d.balance.lte(0)) return new Decimal(0);
  const mr = monthlyRateForDebt(d, nowTs);
  return d.balance.mul(mr);
}

function clampToCents(x: Decimal): Decimal {
  // round to 2 decimals (bankers care about cents)
  return x.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

function validateInputsStrict(
  studentLoans: StudentLoanIn[],
  creditCards: CreditCardIn[],
  monthlyRepaymentAmount: number,
) {
  if (!Array.isArray(studentLoans) || !Array.isArray(creditCards)) {
    throw new Error("Invalid inputs.");
  }
  const m = new Decimal(monthlyRepaymentAmount);
  if (!m.isFinite() || m.lte(0)) {
    throw new Error("monthlyRepaymentAmount must be > 0");
  }
  for (const l of studentLoans) {
    if (l.balance < 0) throw new Error(`Loan ${l._id} negative balance`);
    if (l.minimumPayment < 0)
      throw new Error(`Loan ${l._id} negative minimum payment`);
    if (l.apr < 0) throw new Error(`Loan ${l._id} negative APR`);
  }
  for (const c of creditCards) {
    if (c.balance < 0) throw new Error(`Card ${c._id} negative balance`);
    if (c.credit_limit <= 0)
      throw new Error(`Card ${c._id} non-positive credit limit`);
    if (c.apr < 0) throw new Error(`Card ${c._id} negative APR`);
    if (c.has_intro_promotion) {
      if (c.intro_apr < 0) throw new Error(`Card ${c._id} negative intro APR`);
    }
  }
}

function computeCardMinimum(balance: Decimal): Decimal {
  // Typical: greater of 1% balance or $25 (capped at full balance)
  const onePct = balance.mul(0.01);
  const floor = new Decimal(25);
  return Decimal.min(balance, Decimal.max(onePct, floor));
}

function deepCopyBalances(debts: Debt[]): Record<string, number> {
  const res: Record<string, number> = {};
  for (const d of debts) res[d.id] = clampToCents(d.balance).toNumber();
  return res;
}

function totalBalance(debts: Debt[]): Decimal {
  return debts.reduce((s, d) => s.add(d.balance), new Decimal(0));
}

function sortByMonthlyInterestDesc(debts: Debt[], nowTs: number): Debt[] {
  return debts
    .slice()
    .sort((a, b) =>
      estimateMonthlyInterest(b, nowTs).cmp(estimateMonthlyInterest(a, nowTs)),
    );
}

// Balance transfer engine: propose initial transfers only, maximizing net benefit with constraints.
// Strategy: greedy by benefit per dollar transferred.
function computeInitialTransfers(
  cards: Debt[],
  nowTs: number,
): InitialTransfer[] {
  // Extract senders (can_send) and receivers (can_receive) from Debt extras (we carried through on construction).
  // We must track available headroom on receivers and balances on senders.
  type CardX = Debt & {
    canSend: boolean;
    canReceive: boolean;
    balanceTransferFee: Decimal; // if fixed, literal dollars, else percent
    isFeePercent: boolean;
  };

  const senders: CardX[] = [];
  const receivers: CardX[] = [];
  for (const d of cards) {
    const cx = d as any as CardX;
    if (cx.canSend) senders.push(cx);
    if (cx.canReceive) receivers.push(cx);
  }

  // For receivers, available headroom: creditLimit - currentBalance
  // For each sender->receiver pair, compute marginal benefit per dollar:
  // benefit ≈ (sender monthly rate - receiver monthly rate over promo/current) * duration - fee per dollar
  // Simplify: Use one-month horizon benefit density to rank. It aligns with avalanche direction and avoids overfitting.
  type Edge = {
    from: CardX;
    to: CardX;
    maxAmount: Decimal;
    feePerDollar: Decimal; // dollars per $1 transferred
    deltaMonthlyRate: Decimal; // from_mr - to_mr (non-negative helpful)
  };

  const edges: Edge[] = [];
  for (const s of senders) {
    if (s.balance.lte(0)) continue;
    for (const r of receivers) {
      if (s.id === r.id) continue;
      const rLimit = r.creditLimit ?? new Decimal(0);
      const headroom = Decimal.max(0, rLimit.minus(r.balance));
      if (headroom.lte(0)) continue;

      // feePerDollar
      const feePerDollar = (r as any).isFeePercent
        ? (r as any).balanceTransferFee.div(100) // percent fee on transfer amount
        : (r as any).balanceTransferFee.div(Decimal.max(headroom, 1)); // approximate density for ranking

      const sMr = monthlyRateForDebt(s, nowTs);
      const rMr = monthlyRateForDebt(r, nowTs);
      const delta = Decimal.max(0, sMr.minus(rMr));
      if (delta.lte(0) && feePerDollar.gte(delta)) continue;

      const maxAmount = Decimal.min(s.balance, headroom);
      if (maxAmount.lte(0)) continue;

      edges.push({
        from: s,
        to: r,
        maxAmount,
        feePerDollar,
        deltaMonthlyRate: delta,
      });
    }
  }

  // Rank by net density: deltaMonthlyRate - feePerDollar
  edges.sort((a, b) =>
    b.deltaMonthlyRate
      .minus(b.feePerDollar)
      .cmp(a.deltaMonthlyRate.minus(a.feePerDollar)),
  );

  const transfers: InitialTransfer[] = [];
  for (const e of edges) {
    // Recompute current capacities as we modify balances
    const s = e.from;
    const r = e.to;
    const rLimit = r.creditLimit ?? new Decimal(0);
    const headroom = Decimal.max(0, rLimit.minus(r.balance));
    const senderAvail = s.balance;
    const moveAmt = Decimal.min(senderAvail, headroom, e.maxAmount);
    if (moveAmt.lte(0)) continue;

    // Fee
    const fee = (r as any).isFeePercent
      ? clampToCents(moveAmt.mul((r as any).balanceTransferFee).div(100))
      : clampToCents((r as any).balanceTransferFee);

    // Net monthly benefit approx = moveAmt * (deltaMonthlyRate) - fee
    const netMonthly = moveAmt.mul(e.deltaMonthlyRate).minus(fee);
    if (netMonthly.lte(0)) continue; // not worth it

    // Apply transfer
    s.balance = s.balance.minus(moveAmt);
    r.balance = r.balance.plus(moveAmt).plus(fee);

    transfers.push({
      from: s.id,
      to: r.id,
      amount: clampToCents(moveAmt).toNumber(),
      fee: fee.toNumber(),
    });
  }
  return transfers;
}

export function generateAvalanchePlan(
  studentLoansIn: StudentLoanIn[],
  creditCardsIn: CreditCardIn[],
  monthlyRepaymentAmount: number,
  perserveCreditScore: boolean,
): DebtRepaymentPlan {
  validateInputsStrict(studentLoansIn, creditCardsIn, monthlyRepaymentAmount);
  const now0 = Date.now();

  // Normalize to internal Debt[]
  const debts: Debt[] = [];
  for (const l of studentLoansIn) {
    debts.push({
      id: l._id,
      type: "loan",
      compounded: l.compounded,
      balance: new Decimal(l.balance),
      aprAnnualPct: pctToDecimal(l.apr),
      minimumPayment: new Decimal(l.minimumPayment),
      issuer: l.issuer,
      nickname: l.nickname,
    });
  }
  for (const c of creditCardsIn) {
    const d: Debt = {
      id: c._id,
      type: "card",
      compounded: c.compounded,
      balance: new Decimal(c.balance),
      aprAnnualPct: pctToDecimal(c.apr),
      hasIntro: c.has_intro_promotion,
      introAprPct: pctToDecimal(c.intro_apr ?? 0),
      introExpTs: c.intro_expiration_timestamp,
      creditLimit: new Decimal(c.credit_limit),
      minimumPayment: computeCardMinimum(new Decimal(c.balance)),
      issuer: c.issuer,
      nickname: c.nickname,
    } as any;
    // attach transfer metadata for initial transfer engine
    (d as any).canSend = c.can_send_balance_transfer;
    (d as any).canReceive = c.can_recieve_balance_transfer;
    (d as any).isFeePercent = c.is_balance_transfer_fee_fixed; // per prompt: if true => percentage value
    (d as any).balanceTransferFee = new Decimal(c.balance_transfer_fee);
    debts.push(d);
  }

  // Ensure minimums are not greater than balances
  for (const d of debts) {
    d.minimumPayment = Decimal.min(d.minimumPayment, d.balance);
  }

  // Pre-check: monthly must be >= sum of minimums
  const minSum = debts.reduce(
    (s, d) => s.add(d.minimumPayment),
    new Decimal(0),
  );
  const monthlyBudget = new Decimal(monthlyRepaymentAmount);
  if (monthlyBudget.lt(minSum)) {
    throw new Error(
      `Monthly amount ${monthlyBudget.toNumber()} is below total minimums ${clampToCents(
        minSum,
      ).toNumber()}`,
    );
  }

  // Initial transfers (greedy), done only once
  const cardDebts = debts.filter((d) => d.type === "card");
  const initial_transfers = computeInitialTransfers(cardDebts, now0);

  // Monthly loop
  const monthly_schedule: MonthlyScheduleEntry[] = [];
  let month = 0;
  let total_interest_paid = new Decimal(0);

  // For utilization policy
  const utilTarget = perserveCreditScore ? 0.3 : 0.95;

  // Helper to build account balances snapshot
  const snapshotBalances = () => {
    const map: Record<string, number> = {};
    for (const d of debts) {
      map[d.id] = clampToCents(d.balance).toNumber();
    }
    return map;
  };

  // Continue until all balances cleared or cap months
  while (totalBalance(debts).gt(0) && month < 600) {
    month++;
    const nowTs = now0 + (month - 1) * 30 * 24 * 3600 * 1000;

    // Balances at start
    const balance_start = snapshotBalances();

    // 1) Accrue interest first or after? Industry statements post-interest at cycle end.
    // We'll accrue interest after payments to match "use all dollars now" while still counting interest that accrues on remaining balances.
    // But to report monthly interest in schedule, we compute based on post-payment balances. We’ll store the actual charged interest.

    // 2) Compute minimum payments fresh (cards minimum depends on current balance)
    for (const d of debts) {
      if (d.type === "card") {
        d.minimumPayment = computeCardMinimum(d.balance);
      } else {
        d.minimumPayment = Decimal.min(d.minimumPayment, d.balance);
      }
    }

    // 3) Allocate payments: always spend the full monthlyBudget unless final month
    let budget = monthlyBudget;

    // Pay minimums first
    const paymentsMap: Record<string, Decimal> = {};
    for (const d of debts) {
      const minP = Decimal.min(d.minimumPayment, d.balance);
      paymentsMap[d.id] = (paymentsMap[d.id] ?? new Decimal(0)).add(minP);
      budget = budget.minus(minP);
    }

    // 4) With remaining budget, allocate using avalanche by expected monthly interest cost,
    // but respect utilization target on cards.
    // If perserveCreditScore, we first ensure cards above target utilization are brought down towards target before extra to loans.

    const order = sortByMonthlyInterestDesc(
      debts.filter((d) => d.balance.gt(0)),
      nowTs,
    );

    // Phase A: If preserve flag, prioritize paying down cards above target utilization to target
    if (perserveCreditScore) {
      for (const d of order) {
        if (budget.lte(0)) break;
        if (d.type !== "card") continue;
        const limit = d.creditLimit ?? new Decimal(0);
        if (limit.lte(0)) continue;
        const targetBal = clampToCents(limit.mul(utilTarget));
        if (d.balance.lte(targetBal)) continue;
        const need = Decimal.min(budget, d.balance.minus(targetBal));
        if (need.lte(0)) continue;
        paymentsMap[d.id] = (paymentsMap[d.id] ?? new Decimal(0)).add(need);
        budget = budget.minus(need);
      }
    }

    // Phase B: Avalanche all remaining by highest expected monthly interest
    for (const d of order) {
      if (budget.lte(0)) break;
      if (d.balance.lte(0)) continue;

      // Utilization ceiling on cards
      if (d.type === "card") {
        const limit = d.creditLimit ?? new Decimal(0);
        if (limit.gt(0)) {
          const minAllowedBal = clampToCents(limit.mul(utilTarget)); // keep at or below target if preserve; else 95%
          // We are paying down, so utilization cap doesn't restrict paying.
          // But ensure we don't try to push balance negative.
          const maxExtra = Decimal.max(0, d.balance.minus(new Decimal(0)));
          const extra = Decimal.min(budget, maxExtra);
          if (extra.gt(0)) {
            paymentsMap[d.id] = (paymentsMap[d.id] ?? new Decimal(0)).add(
              extra,
            );
            budget = budget.minus(extra);
          }
        } else {
          // No limit info; just pay as usual
          const extra = Decimal.min(budget, d.balance);
          if (extra.gt(0)) {
            paymentsMap[d.id] = (paymentsMap[d.id] ?? new Decimal(0)).add(
              extra,
            );
            budget = budget.minus(extra);
          }
        }
      } else {
        // Loans: just pay as much as possible
        const extra = Decimal.min(budget, d.balance);
        if (extra.gt(0)) {
          paymentsMap[d.id] = (paymentsMap[d.id] ?? new Decimal(0)).add(extra);
          budget = budget.minus(extra);
        }
      }
    }

    // If we somehow still have budget and all balances will be paid off this month, cap to balances
    if (budget.gt(0)) {
      // This can happen only on the final month; we won't force spend.
      // It's acceptable to leave remaining budget unused here.
    }

    // Apply payments
    for (const d of debts) {
      const pay = clampToCents(paymentsMap[d.id] ?? new Decimal(0));
      if (pay.gt(d.balance)) {
        // Guard: cap to balance
        const capped = clampToCents(d.balance);
        paymentsMap[d.id] = capped;
        d.balance = d.balance.minus(capped);
      } else {
        d.balance = d.balance.minus(pay);
      }
    }

    // 5) Accrue monthly interest on remaining balances
    const interestMap: Record<string, Decimal> = {};
    for (const d of debts) {
      if (d.balance.lte(0)) {
        interestMap[d.id] = new Decimal(0);
        continue;
      }
      const interest = clampToCents(estimateMonthlyInterest(d, nowTs));
      d.balance = d.balance.add(interest);
      interestMap[d.id] = interest;
      total_interest_paid = total_interest_paid.add(interest);
    }

    // Remove tiny dust
    for (const d of debts) {
      if (d.balance.abs().lt(0.005)) d.balance = new Decimal(0);
    }

    // Record schedule entry
    const entry: MonthlyScheduleEntry = {
      month,
      balance_start,
      interest: Object.fromEntries(
        Object.entries(interestMap).map(([k, v]) => [k, v.toNumber()]),
      ),
      payments: Object.fromEntries(
        Object.entries(paymentsMap).map(([k, v]) => [
          k,
          clampToCents(v).toNumber(),
        ]),
      ),
      balance_end: snapshotBalances(),
    };
    monthly_schedule.push(entry);

    // Stop if all paid
    if (totalBalance(debts).lte(0)) break;
  }

  return {
    initial_transfers,
    monthly_schedule,
    months_to_payoff: month,
    total_interest_paid: clampToCents(total_interest_paid).toNumber(),
  };
}

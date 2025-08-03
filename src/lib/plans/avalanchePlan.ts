import Decimal from "decimal.js";

function calculateEffectiveRate(
  nominalRate: number,
  compoundingPerYear: number,
): number {
  return Math.pow(1 + nominalRate / compoundingPerYear, compoundingPerYear) - 1;
}

function getCompoundingFrequency(
  compounded: "daily" | "monthly" | "yearly",
): number {
  switch (compounded) {
    case "daily":
      return 365;
    case "monthly":
      return 12;
    case "yearly":
      return 1;
  }
}

function calculateMonthlyInterest(
  balance: string,
  apr: string,
  compounded: "daily" | "monthly" | "yearly",
  daysInCycle: number = 30,
  isLeapYear: boolean = false,
): string {
  const principal = new Decimal(balance);
  const annualRate = new Decimal(apr).div(100);

  if (compounded === "daily") {
    const daysInYear = isLeapYear ? 366 : 365;
    const dailyRate = annualRate.div(daysInYear);
    return principal.mul(dailyRate).mul(daysInCycle).toFixed(2);
  } else if (compounded === "monthly") {
    const monthlyRate = annualRate.div(12);
    return principal.mul(monthlyRate).toFixed(2);
  } else {
    // Yearly compounding approximated monthly
    const monthlyRate = annualRate.div(12);
    return principal.mul(monthlyRate).toFixed(2);
  }
}

interface BalanceTransferOption {
  fromCardId: string;
  toCardId: string;
  transferAmount: number;
  transferFee: number;
  currentAPR: number;
  newAPR: number;
  promotionalPeriodMonths?: number;
}

function calculateTransferBenefit(
  option: BalanceTransferOption,
  monthlyPayment: number,
): number {
  const {
    transferAmount,
    transferFee,
    currentAPR,
    newAPR,
    promotionalPeriodMonths,
  } = option;

  // Calculate payoff timeline with current APR
  const currentMonthsToPayoff = calculatePayoffTime(
    transferAmount,
    currentAPR,
    monthlyPayment,
  );

  // Calculate interest savings during promotional period
  let interestSavings = 0;
  const promotionalMonths = promotionalPeriodMonths || currentMonthsToPayoff;
  const monthsToCalculate = Math.min(promotionalMonths, currentMonthsToPayoff);

  for (let month = 1; month <= monthsToCalculate; month++) {
    const remainingBalance = calculateRemainingBalance(
      transferAmount,
      currentAPR,
      monthlyPayment,
      month,
    );
    const monthlySavings = (remainingBalance * (currentAPR - newAPR)) / 12;
    interestSavings += monthlySavings;
  }

  return interestSavings - transferFee;
}

function optimizeBalanceTransfers(
  creditCards: Array<{
    _id: string;
    balance: number;
    apr: number;
    intro_apr: number;
    intro_expiration_timestamp: number;
    has_intro_promotion: boolean;
    credit_limit: number;
    can_send_balance_transfer: boolean;
    can_recieve_balance_transfer: boolean;
    balance_transfer_fee: number;
    is_balance_transfer_fee_fixed: boolean;
  }>,
  monthlyPayment: number,
): BalanceTransferOption[] {
  const transfers: BalanceTransferOption[] = [];

  // Sort cards by APR for transfer prioritization
  const sourceCards = creditCards
    .filter((card) => card.can_send_balance_transfer && card.balance > 0)
    .sort((a, b) => b.apr - a.apr); // Highest APR first

  const targetCards = creditCards
    .filter((card) => card.can_recieve_balance_transfer)
    .sort((a, b) => {
      const aEffectiveRate = a.has_intro_promotion ? a.intro_apr : a.apr;
      const bEffectiveRate = b.has_intro_promotion ? b.intro_apr : b.apr;
      return aEffectiveRate - bEffectiveRate; // Lowest APR first
    });

  for (const sourceCard of sourceCards) {
    for (const targetCard of targetCards) {
      if (sourceCard._id === targetCard._id) continue;

      const availableCredit = targetCard.credit_limit - targetCard.balance;
      const maxTransfer = Math.min(sourceCard.balance, availableCredit);

      if (maxTransfer <= 0) continue;

      const transferFee = targetCard.is_balance_transfer_fee_fixed
        ? targetCard.balance_transfer_fee
        : maxTransfer * (targetCard.balance_transfer_fee / 100);

      const option: BalanceTransferOption = {
        fromCardId: sourceCard._id,
        toCardId: targetCard._id,
        transferAmount: maxTransfer,
        transferFee,
        currentAPR: sourceCard.apr,
        newAPR: targetCard.has_intro_promotion
          ? targetCard.intro_apr
          : targetCard.apr,
        promotionalPeriodMonths: targetCard.has_intro_promotion
          ? Math.ceil(
              (targetCard.intro_expiration_timestamp - Date.now()) /
                (1000 * 60 * 60 * 24 * 30),
            )
          : undefined,
      };

      const benefit = calculateTransferBenefit(option, monthlyPayment);
      if (benefit > 0) {
        transfers.push(option);
      }
    }
  }

  return transfers.sort(
    (a, b) =>
      calculateTransferBenefit(b, monthlyPayment) -
      calculateTransferBenefit(a, monthlyPayment),
  );
}

function calculateUtilizationRatio(
  balance: number,
  creditLimit: number,
): number {
  return balance / creditLimit;
}

function preserveCreditScore(
  creditCards: Array<{ _id: string; balance: number; credit_limit: number }>,
  maxUtilizationPerCard: number = 0.3,
  maxOverallUtilization: number = 0.3,
): boolean {
  const totalBalance = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalLimit = creditCards.reduce(
    (sum, card) => sum + card.credit_limit,
    0,
  );
  const overallUtilization = totalBalance / totalLimit;

  if (overallUtilization > maxOverallUtilization) return false;

  return creditCards.every(
    (card) =>
      calculateUtilizationRatio(card.balance, card.credit_limit) <=
      maxUtilizationPerCard,
  );
}

function adjustPaymentsForCreditHealth(
  payments: Map<string, number>,
  creditCards: Array<{ _id: string; balance: number; credit_limit: number }>,
  preserveCreditScore: boolean,
): Map<string, number> {
  if (!preserveCreditScore) return payments;

  const adjustedPayments = new Map(payments);
  const utilizationLimit = 0.3;

  for (const card of creditCards) {
    const proposedPayment = adjustedPayments.get(card._id) || 0;
    const newBalance = card.balance - proposedPayment;
    const newUtilization = newBalance / card.credit_limit;

    if (newUtilization > utilizationLimit) {
      const maxAllowedBalance = card.credit_limit * utilizationLimit;
      const maxPayment = card.balance - maxAllowedBalance;
      adjustedPayments.set(card._id, Math.max(0, maxPayment));
    }
  }

  return adjustedPayments;
}

function validateInputs(
  studentLoans: Array<{ balance: number; apr: number; minimumPayment: number }>,
  creditCards: Array<{
    _id: string;
    balance: number;
    apr: number;
    credit_limit: number;
  }>,
  monthlyRepaymentAmount: number,
): void {
  // Validate student loans
  for (const loan of studentLoans) {
    if (loan.balance < 0)
      throw new Error(`Invalid loan balance: ${loan.balance}`);
    if (loan.apr < 0 || loan.apr > 1)
      throw new Error(`Invalid loan APR: ${loan.apr}`);
    if (loan.minimumPayment < 0)
      throw new Error(`Invalid minimum payment: ${loan.minimumPayment}`);
  }

  // Validate credit cards
  for (const card of creditCards) {
    if (card.balance < 0)
      throw new Error(`Invalid card balance: ${card.balance}`);
    if (card.balance > card.credit_limit)
      throw new Error(`Balance exceeds credit limit for card ${card._id}`);
    if (card.apr < 0 || card.apr > 1)
      throw new Error(`Invalid card APR: ${card.apr}`);
    if (card.credit_limit <= 0)
      throw new Error(`Invalid credit limit: ${card.credit_limit}`);
  }

  // Validate monthly repayment
  if (monthlyRepaymentAmount <= 0)
    throw new Error(
      `Invalid monthly repayment amount: ${monthlyRepaymentAmount}`,
    );
}

function calculatePayoffTime(
  balance: number,
  apr: number,
  monthlyPayment: number,
): number {
  if (monthlyPayment <= (balance * apr) / 12) {
    return Infinity; // Payment too small to make progress
  }

  const monthlyRate = apr / 12;
  return Math.ceil(
    Math.log(1 + (balance * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate),
  );
}

function calculateRemainingBalance(
  balance: number,
  apr: number,
  monthlyPayment: number,
  monthsElapsed: number,
): number {
  const monthlyRate = apr / 12;
  const factor = Math.pow(1 + monthlyRate, monthsElapsed);
  return balance * factor - (monthlyPayment * (factor - 1)) / monthlyRate;
}

interface DebtRepaymentPlan {
  monthlyPayments: Array<{
    month: number;
    payments: Array<{
      debtId: string;
      amount: number;
      isMinimum: boolean;
    }>;
    balanceTransfers?: Array<{
      fromDebtId: string;
      toDebtId: string;
      amount: number;
      fee: number;
    }>;
    remainingBalances: Array<{
      debtId: string;
      balance: number;
    }>;
  }>;
  totalInterestPaid: number;
  totalMonthsToPayoff: number;
  creditScoreImpact?: {
    maxUtilization: number;
    averageUtilization: number;
  };
}

export function generateAvalanchePlan(
  studentLoans: Array<{
    _id: string;
    balance: number;
    apr: number;
    minimumPayment: number;
    compounded: "daily" | "monthly" | "yearly";
  }>,
  creditCards: Array<{
    _id: string;
    balance: number;
    apr: number;
    intro_apr: number;
    intro_expiration_timestamp: number;
    has_intro_promotion: boolean;
    credit_limit: number;
    can_send_balance_transfer: boolean;
    can_recieve_balance_transfer: boolean;
    balance_transfer_fee: number;
    is_balance_transfer_fee_fixed: boolean;
    compounded: "daily" | "monthly" | "yearly";
  }>,
  monthlyRepaymentAmount: number,
  preserveCreditScore: boolean,
): DebtRepaymentPlan {
  // Step 1: Calculate effective interest rates for all debts
  const allDebts = [
    ...studentLoans.map((loan) => ({
      ...loan,
      type: "loan" as const,
      effectiveAPR: calculateEffectiveRate(
        loan.apr,
        getCompoundingFrequency(loan.compounded),
      ),
      credit_limit: 0,
    })),
    ...creditCards.map((card) => ({
      ...card,
      type: "credit_card" as const,
      effectiveAPR: card.has_intro_promotion
        ? calculateEffectiveRate(
            card.intro_apr,
            getCompoundingFrequency(card.compounded),
          )
        : calculateEffectiveRate(
            card.apr,
            getCompoundingFrequency(card.compounded),
          ),
      minimumPayment: Math.max(card.balance * 0.01, 25), // Typical 1% minimum
    })),
  ];

  // Step 2: Validate minimum payment requirements
  const totalMinimums = allDebts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0,
  );
  if (monthlyRepaymentAmount < totalMinimums) {
    throw new Error(
      `Monthly repayment amount ($${monthlyRepaymentAmount}) insufficient for minimum payments ($${totalMinimums})`,
    );
  }

  let currentDebts = [...allDebts];
  let totalInterestPaid = 0;
  let month = 0;
  const monthlyPayments: DebtRepaymentPlan["monthlyPayments"] = [];

  while (currentDebts.length > 0 && month < 600) {
    // 50 year maximum
    month++;

    // Step 3: Evaluate balance transfer opportunities each month
    const transferOpportunities = optimizeBalanceTransfers(
      creditCards.filter((card) =>
        currentDebts.some((debt) => debt._id === card._id),
      ),
      monthlyRepaymentAmount,
    );

    const executedTransfers: Array<{
      fromDebtId: string;
      toDebtId: string;
      amount: number;
      fee: number;
    }> = [];

    // Execute most beneficial transfers first
    for (const transfer of transferOpportunities.slice(0, 3)) {
      // Limit to 3 transfers per month
      const fromDebt = currentDebts.find((d) => d._id === transfer.fromCardId);
      const toDebt = currentDebts.find((d) => d._id === transfer.toCardId);

      if (fromDebt && toDebt && transfer.transferAmount > 0) {
        // Execute transfer
        fromDebt.balance -= transfer.transferAmount;
        toDebt.balance += transfer.transferAmount + transfer.transferFee;

        executedTransfers.push({
          fromDebtId: transfer.fromCardId,
          toDebtId: transfer.toCardId,
          amount: transfer.transferAmount,
          fee: transfer.transferFee,
        });

        totalInterestPaid += transfer.transferFee;
      }
    }

    // Step 4: Sort debts by effective APR (avalanche order)
    currentDebts.sort((a, b) => {
      // Handle promotional APR expirations
      const aAPR =
        a.type === "credit_card" &&
        a.has_intro_promotion &&
        Date.now() > a.intro_expiration_timestamp
          ? a.apr
          : a.effectiveAPR;
      const bAPR =
        b.type === "credit_card" &&
        b.has_intro_promotion &&
        Date.now() > b.intro_expiration_timestamp
          ? b.apr
          : b.effectiveAPR;

      return bAPR - aAPR; // Highest rate first
    });

    // Step 5: Calculate monthly payments using avalanche strategy
    let remainingPayment = monthlyRepaymentAmount;
    const monthPayments: Array<{
      debtId: string;
      amount: number;
      isMinimum: boolean;
    }> = [];

    // Pay minimums first
    for (const debt of currentDebts) {
      const minimumPayment = Math.min(debt.minimumPayment, debt.balance);
      monthPayments.push({
        debtId: debt._id,
        amount: minimumPayment,
        isMinimum: true,
      });
      remainingPayment -= minimumPayment;
      debt.balance -= minimumPayment;
    }

    // Apply extra payments to highest rate debt (avalanche)
    let debtIndex = 0;
    while (remainingPayment > 0 && debtIndex < currentDebts.length) {
      const targetDebt = currentDebts[debtIndex];

      if (targetDebt.balance > 0) {
        // Check credit utilization constraints
        let maxPayment = remainingPayment;

        if (preserveCreditScore && targetDebt.type === "credit_card") {
          const maxUtilizationBalance = targetDebt.credit_limit * 0.3;
          const maxAllowablePayment = Math.max(
            0,
            targetDebt.balance - maxUtilizationBalance,
          );
          maxPayment = Math.min(remainingPayment, maxAllowablePayment);
        } else if (!preserveCreditScore && targetDebt.type === "credit_card") {
          // Max 95% utilization when not preserving credit score
          const maxUtilizationBalance = targetDebt.credit_limit * 0.95;
          const maxAllowablePayment = Math.max(
            0,
            targetDebt.balance - maxUtilizationBalance,
          );
          maxPayment = Math.min(remainingPayment, maxAllowablePayment);
        }

        const extraPayment = Math.min(maxPayment, targetDebt.balance);

        if (extraPayment > 0) {
          monthPayments.push({
            debtId: targetDebt._id,
            amount: extraPayment,
            isMinimum: false,
          });
          targetDebt.balance -= extraPayment;
          remainingPayment -= extraPayment;
        }
      }

      debtIndex++;
    }

    // Step 6: Apply monthly interest to remaining balances
    for (const debt of currentDebts) {
      if (debt.balance > 0) {
        const monthlyInterest = parseFloat(
          calculateMonthlyInterest(
            debt.balance.toString(),
            debt.type === "credit_card" &&
              debt.has_intro_promotion &&
              Date.now() <= debt.intro_expiration_timestamp
              ? debt.intro_apr.toString()
              : debt.apr.toString(),
            debt.compounded,
          ),
        );

        debt.balance += monthlyInterest;
        totalInterestPaid += monthlyInterest;
      }
    }

    // Step 7: Remove paid-off debts
    currentDebts = currentDebts.filter((debt) => debt.balance > 0.01); // Allow for rounding errors

    // Step 8: Record month's activity
    monthlyPayments.push({
      month,
      payments: monthPayments,
      balanceTransfers:
        executedTransfers.length > 0 ? executedTransfers : undefined,
      remainingBalances: currentDebts.map((debt) => ({
        debtId: debt._id,
        balance: Math.round(debt.balance * 100) / 100,
      })),
    });
  }

  // Step 9: Calculate credit score impact metrics
  let creditScoreImpact: DebtRepaymentPlan["creditScoreImpact"];
  if (preserveCreditScore) {
    const finalCreditCards = creditCards.filter((card) =>
      currentDebts.some((debt) => debt._id === card._id),
    );

    const utilizations = finalCreditCards.map((card) => {
      const finalDebt = currentDebts.find((debt) => debt._id === card._id);
      return finalDebt ? finalDebt.balance / card.credit_limit : 0;
    });

    creditScoreImpact = {
      maxUtilization: Math.max(...utilizations, 0),
      averageUtilization:
        utilizations.length > 0
          ? utilizations.reduce((a, b) => a + b) / utilizations.length
          : 0,
    };
  }

  return {
    monthlyPayments,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalMonthsToPayoff: month,
    creditScoreImpact,
  };
}

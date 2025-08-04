import { LoadingSpinner } from "@/components/loading-spinner";
import { NumberInput } from "@/components/number-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MainLayout } from "@/layout/main-layout";
import { generateAvalanchePlan } from "@/lib/plans/avalanchePlan";
import { SetState, UserResource } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MountainSnowIcon,
  PieChartIcon,
  PiggyBankIcon,
  SnowflakeIcon,
  SparklesIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../convex/_generated/api";

enum DebtPayoffStrategy {
  Cascade = "cascade",
  Avalanche = "avalanche",
  Snowball = "snowball",
}

function IntroDisplay({
  onSubmit,
  repaymentAmount,
  setRepaymentAmount,
  strategy,
  setStrategy,
  preserveCreditScore,
  setPreserveCreditScore,
}: {
  onSubmit: () => void;
  repaymentAmount: number;
  setRepaymentAmount: SetState<number>;
  strategy: DebtPayoffStrategy;
  setStrategy: SetState<DebtPayoffStrategy>;
  preserveCreditScore: boolean;
  setPreserveCreditScore: SetState<boolean>;
}) {
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 3;
  const incrementStep = () => setStep(step + 1);
  const decrementStep = () => setStep(step - 1);
  const id = useId();

  const strategies = [
    {
      id: "avalanche",
      name: "The Avalanche Method",
      description:
        "Pay off your highest interest debts first and work your way down.",
      icon: MountainSnowIcon,
    },
    {
      id: "snowball",
      name: "The Snowball Method",
      description: "Pay off your smallest debts first and work your way up.",
      icon: SnowflakeIcon,
    },
  ];
  return (
    <div className="flex-1 flex flex-col gap-5 items-center justify-center">
      <div className="space-y-8 max-w-3xl">
        {step > 0 && (
          <Button size="lg" onClick={decrementStep} variant="outline">
            <ChevronLeftIcon />
            Previous
          </Button>
        )}
        {step === 0 && (
          <div className="flex flex-col gap-5 items-center">
            <h1 className="text-2xl font-bold">
              You are one step closer to financial freedom!
            </h1>
            <div className="flex-col text-center text-muted-foreground">
              How much are you willing to commit a month towards your debt?
            </div>
            {/* todo: insert a graph or facts about how important and beneficial it is to pay off debt */}
            <NumberInput
              id="repaymentAmount"
              name="repaymentAmount"
              value={repaymentAmount}
              onValueChange={(value) => setRepaymentAmount(value ?? 0)}
              thousandSeparator=","
              decimalSeparator="."
              decimalScale={2}
              prefix="$ "
              suffix=" / month"
              className="w-auto md:text-2xl h-auto py-4 px-4"
              stepper={100}
            />
            <div className="flex-col text-center text-muted-foreground text-xs">
              Payments will be automatically deducted from your bank account.
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold">Choose a repayment strategy</h1>
            <div className="flex-col text-center text-muted-foreground">
              We want to personalize your plan to your situation. Choose what
              you want to prioritize.
            </div>
            <RadioGroup
              id="repaymentStrategy"
              className="gap-2"
              defaultValue={strategy}
              onValueChange={(value) => {
                if (
                  !Object.values(DebtPayoffStrategy).includes(
                    value as DebtPayoffStrategy,
                  )
                )
                  return;
                setStrategy(value as DebtPayoffStrategy);
              }}
            >
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
                >
                  <RadioGroupItem
                    value={strategy.id}
                    id={`${id}-${strategy.id}`}
                    aria-describedby={`${id}-${strategy.id}-description`}
                    className="order-1 after:absolute after:inset-0 my-auto"
                  />
                  <div className="flex gap-4 flex-1">
                    <div className="size-10 flex items-center justify-center">
                      <strategy.icon className="size-10" />
                    </div>
                    <div className="grid grow gap-2 flex-1">
                      <Label htmlFor={`${id}-${strategy.id}`}>
                        {strategy.name}
                      </Label>
                      <p
                        id={`${id}-${strategy.id}-description`}
                        className="text-xs text-muted-foreground"
                      >
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-center">
              Do you want to preserve your credit score at the cost of time?
            </h1>
            <div className="flex-col text-center text-muted-foreground space-y-2">
              <p>
                Our algorithm, by default, will prioritize paying off your debts
                as quickly as possible.
              </p>
              <p>
                This may mean moving money from high interest rate cards to low
                interest rate cards resulting in high usage on those low
                interest rate cards. This is ideal when trying to pay off debt
                as fast as possible and for less total amount of interest paid.
              </p>
              <p>
                However, if you want to preserve your credit score, you can
                choose to prioritize it at the cost of time.
              </p>
            </div>
            <RadioGroup
              id="creditScorePreservation"
              className="gap-2"
              defaultValue={preserveCreditScore ? "yes" : "no"}
              onValueChange={(value) => {
                setPreserveCreditScore(value === "yes");
              }}
            >
              {[
                {
                  id: "yes",
                  name: "Yes, I want to preserve my credit score at the cost of time.",
                  description:
                    "This means that we will work towards lowering your credit card usage as much as possible while still paying off your debt as quickly as possible.",
                  icon: MountainSnowIcon,
                },
                {
                  id: "no",
                  name: "No, I want to pay off my debt as quickly as possible.",
                  description:
                    "This means that we will prioritize paying off your debts as quickly as possible. Things like high credit card usage will be used as optimally as possible to shorten the time it takes to pay off your debt.",
                  icon: SnowflakeIcon,
                },
              ].map((strategy) => (
                <div
                  key={strategy.id}
                  className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
                >
                  <RadioGroupItem
                    value={strategy.id}
                    id={`${id}-${strategy.id}`}
                    aria-describedby={`${id}-${strategy.id}-description`}
                    className="order-1 after:absolute after:inset-0 my-auto"
                  />
                  <div className="flex gap-4 flex-1">
                    <div className="size-10 flex items-center justify-center">
                      <strategy.icon className="size-10" />
                    </div>
                    <div className="grid grow gap-2 flex-1">
                      <Label htmlFor={`${id}-${strategy.id}`}>
                        {strategy.name}
                      </Label>
                      <p
                        id={`${id}-${strategy.id}-description`}
                        className="text-xs text-muted-foreground"
                      >
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </>
        )}
        {step < TOTAL_STEPS - 1 && (
          <Button
            className="w-full py-4 h-auto text-lg gap-4"
            size="lg"
            onClick={incrementStep}
          >
            <span className="size-8"></span>
            Next
            <ChevronRightIcon className="size-8" />
          </Button>
        )}
        {step === TOTAL_STEPS - 1 && (
          <Button
            className="w-full py-4 h-auto text-lg gap-4"
            size="lg"
            onClick={onSubmit}
          >
            <SparklesIcon className="size-8" />
            Generate a Plan
          </Button>
        )}
      </div>
    </div>
  );
}

function RepaymentPlanDisplay({
  repaymentAmount,
  strategy,
  preserveCreditScore,
  setRepaymentAmount,
  setStrategy,
  setPreserveCreditScore,
}: {
  repaymentAmount: number;
  setRepaymentAmount: SetState<number>;
  strategy: DebtPayoffStrategy;
  setStrategy: SetState<DebtPayoffStrategy>;
  preserveCreditScore: boolean;
  setPreserveCreditScore: SetState<boolean>;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const studentLoans = useQuery(api.studentLoans.get) ?? [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const creditCards = useQuery(api.creditCards.get) ?? [];

  const plan = useMemo(() => {
    return generateAvalanchePlan(
      studentLoans,
      creditCards,
      repaymentAmount,
      preserveCreditScore,
    );
  }, [studentLoans, creditCards, repaymentAmount, preserveCreditScore]);

  console.log("input:", {
    studentLoans,
    creditCards,
    repaymentAmount,
    preserveCreditScore,
  });
  console.log("output:", plan);

  // Aggregate monthly insights for charts & summaries
  const chartData = useMemo(() => {
    let totalStartingBalance = 0;
    const balancesById: Record<string, number> = {};

    [...studentLoans, ...creditCards].forEach((d) => {
      balancesById[d._id] = d.balance;
      totalStartingBalance += d.balance;
    });

    const data = plan.monthly_schedule.map((m) => {
      // Sum remaining balances for this month
      const totalBalance = m.remainingBalances.reduce(
        (s, b) => s + b.balance,
        0,
      );
      const monthPayment = m.payments.reduce((s, p) => s + p.amount, 0);

      // Approximate utilization and credit health
      const ccBalances = m.remainingBalances.filter((b) =>
        creditCards.some((c) => c._id === b.debtId),
      );
      const totalCcBalance = ccBalances.reduce((s, b) => s + b.balance, 0);
      const totalCcLimit =
        creditCards.reduce((s, c) => s + c.credit_limit, 0) || 1;
      const utilization = totalCcBalance / totalCcLimit; // 0..1

      return {
        month: m.month,
        totalBalance,
        totalDebtRatio:
          totalStartingBalance === 0 ? 0 : totalBalance / totalStartingBalance,
        payment: monthPayment,
        utilization,
      };
    });

    // Interest over time: approximate from deltas of total balances + payments
    const interestData = data.map((d, idx) => {
      if (idx === 0)
        return {
          month: d.month,
          interest: Math.max(
            0,
            totalStartingBalance + d.payment - d.totalBalance,
          ),
        };
      const prev = data[idx - 1];
      const delta = prev.totalBalance - d.totalBalance; // principal + interest - payments
      const interest = Math.max(0, d.payment - delta);
      return { month: d.month, interest };
    });

    return { data, interestData };
  }, [plan, studentLoans, creditCards]);

  // Map debt metadata for labels/icons
  const debtMeta: Record<
    string,
    { type: "loan" | "credit_card"; name: string; issuer?: string }
  > = useMemo(() => {
    const meta: Record<string, any> = {};
    studentLoans.forEach(
      (l) =>
        (meta[l._id] = {
          type: "loan",
          name: l.nickname ?? "Student Loan",
          issuer: l.issuer,
        }),
    );
    creditCards.forEach(
      (c) =>
        (meta[c._id] = {
          type: "credit_card",
          name: c.issuer,
          issuer: c.issuer,
        }),
    );
    return meta;
  }, [studentLoans, creditCards]);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const selectedMonth = plan.monthlyPayments[selectedMonthIndex];

  console.log(plan);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Repayment Plan</h1>
        <div className="flex items-center gap-2">
          <div className="grid grid-rows-2">
            <Label htmlFor="strategy">Monthly Payment Amount</Label>
            <NumberInput
              id="repaymentAmount"
              name="repaymentAmount"
              value={repaymentAmount}
              onValueChange={(value) => setRepaymentAmount(value ?? 0)}
              thousandSeparator=","
              decimalSeparator="."
              decimalScale={2}
              prefix="$ "
              suffix=" / month"
              className="w-full"
              stepper={100}
              incrementorButtonClassName="p-0 h-auto"
            />
          </div>
          <div className="grid grid-rows-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Select
              value={strategy}
              onValueChange={(value) => {
                setStrategy(value as DebtPayoffStrategy);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Strategy" className="w-full" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DebtPayoffStrategy).map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {toTitleCase(strategy)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-rows-2">
            <Label htmlFor="preserveCreditScore">Preserve Credit Score?</Label>
            <Select
              value={preserveCreditScore ? "yes" : "no"}
              onValueChange={(value) => {
                setPreserveCreditScore(value === "yes");
              }}
            >
              <SelectTrigger id="preserveCreditScore" className="w-full">
                <SelectValue placeholder="Preserve Credit Score?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Credit Score</SelectItem>
                <SelectItem value="no">Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Months to Payoff
            </CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.totalMonthsToPayoff}</div>
            <p className="text-xs text-muted-foreground">Projected duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interest Paid
            </CardTitle>
            <PiggyBankIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${plan.totalInterestPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Cumulative interest</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Max Utilization
            </CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((plan.creditScoreImpact?.maxUtilization ?? 0) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Across cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Utilization
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (plan.creditScoreImpact?.averageUtilization ?? 0) * 100,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Credit health</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">
              Total Debt Ratio Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    domain={[0, 1]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="totalDebtRatio"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Monthly Interest Estimated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.interestData}
                  style={{ height: "100%", width: "100%" }}
                >
                  <defs>
                    <linearGradient
                      id="interestFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${Math.round(v)}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    stroke="#16a34a"
                    fill="url(#interestFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Utilization Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    domain={[0, 1]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Payments Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Month selector */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedMonthIndex((i) => Math.max(0, i - 1))
                  }
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <div className="text-sm">Month {selectedMonth?.month ?? 0}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedMonthIndex((i) =>
                      Math.min(plan.monthlyPayments.length - 1, i + 1),
                    )
                  }
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="secondary">
                $
                {(
                  selectedMonth?.payments.reduce((s, p) => s + p.amount, 0) ?? 0
                ).toLocaleString()}{" "}
                total
              </Badge>
            </div>
            <Separator />
            <div className="divide-y">
              {selectedMonth?.payments.map((p) => {
                const meta = debtMeta[p.debtId];
                const Icon =
                  meta?.type === "credit_card" ? CreditCardIcon : WalletIcon;
                return (
                  <div
                    key={`${selectedMonth.month}-${p.debtId}-${p.isMinimum ? "min" : "extra"}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md ${meta?.type === "credit_card" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {meta?.name ?? p.debtId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.isMinimum ? "Minimum" : "Extra"} payment
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      ${p.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedMonth?.balanceTransfers &&
              selectedMonth.balanceTransfers.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="text-sm font-medium mb-2">
                    Balance Transfers
                  </div>
                  <div className="space-y-2">
                    {selectedMonth.balanceTransfers.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          Transfer ${t.amount.toLocaleString()} from{" "}
                          <Badge variant="outline">
                            {debtMeta[t.fromDebtId]?.name ?? t.fromDebtId}
                          </Badge>{" "}
                          to{" "}
                          <Badge variant="outline">
                            {debtMeta[t.toDebtId]?.name ?? t.toDebtId}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          Fee: ${t.fee.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Remaining balances by debt for current month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Remaining Balances (Month {selectedMonth?.month ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {selectedMonth?.remainingBalances.map((b) => {
            const meta = debtMeta[b.debtId];
            const Icon =
              meta?.type === "credit_card" ? CreditCardIcon : WalletIcon;
            return (
              <div
                key={b.debtId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-md ${meta?.type === "credit_card" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-medium">{meta?.name ?? b.debtId}</div>
                    <div className="text-xs text-muted-foreground">
                      {meta?.type === "credit_card" ? "Credit Card" : "Loan"}
                    </div>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  ${b.balance.toLocaleString()}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

const RepaymentPageContent = (_props: { user: UserResource }) => {
  const [repaymentAmount, setRepaymentAmount] = useState(1_000);
  const [strategy, setStrategy] = useState<DebtPayoffStrategy>(
    DebtPayoffStrategy.Avalanche,
  );
  const [preserveCreditScore, setPreserveCreditScore] = useState(false);

  const [hasChosenRepaymentAmount, setHasChosenRepaymentAmount] =
    useState(false);

  return (
    <MainLayout pageTitle="Repayment">
      <div className="p-4 flex-1">
        <div className="container mx-auto max-w-7xl space-y-8 flex flex-col h-full">
          {hasChosenRepaymentAmount ? (
            <RepaymentPlanDisplay
              repaymentAmount={repaymentAmount}
              strategy={strategy}
              preserveCreditScore={preserveCreditScore}
              setRepaymentAmount={setRepaymentAmount}
              setStrategy={setStrategy}
              setPreserveCreditScore={setPreserveCreditScore}
            />
          ) : (
            <IntroDisplay
              onSubmit={() => setHasChosenRepaymentAmount(true)}
              repaymentAmount={repaymentAmount}
              setRepaymentAmount={setRepaymentAmount}
              strategy={strategy}
              setStrategy={setStrategy}
              preserveCreditScore={preserveCreditScore}
              setPreserveCreditScore={setPreserveCreditScore}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default function RepaymentPage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <LoadingSpinner />;
  if (!user) return <RedirectToSignIn />;
  return <RepaymentPageContent user={user} />;
}

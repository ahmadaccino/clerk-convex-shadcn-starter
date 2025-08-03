import { LoadingSpinner } from "@/components/loading-spinner";
import { NumberInput } from "@/components/number-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MainLayout } from "@/layout/main-layout";
import { generateAvalanchePlan } from "@/lib/plans/avalanchePlan";
import { SetState, UserResource } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MountainSnowIcon,
  SnowflakeIcon,
  SparklesIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";

enum DebtPayoffStrategy {
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

  console.log(plan);

  return (
    <div className="flex-1">
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

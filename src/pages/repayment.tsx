import { LoadingSpinner } from "@/components/loading-spinner";
import { NumberInput } from "@/components/number-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MainLayout } from "@/layout/main-layout";
import { SetState, UserResource } from "@/lib/types";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MountainSnowIcon,
  SnowflakeIcon,
  SparklesIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { api } from "../../convex/_generated/api";

function IntroDisplay({
  onSubmit,
  repaymentAmount,
  setRepaymentAmount,
}: {
  onSubmit: () => void;
  repaymentAmount: number;
  setRepaymentAmount: SetState<number>;
}) {
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 2;
  const incrementStep = () => setStep(step + 1);
  const decrementStep = () => setStep(step - 1);
  const id = useId();

  const strategies = [
    {
      name: "The Avalanche Method",
      description:
        "Pay off your highest interest debts first and work your way down.",
      icon: MountainSnowIcon,
    },
    {
      name: "The Snowball Method",
      description: "Pay off your smallest debts first and work your way up.",
      icon: SnowflakeIcon,
    },
  ];
  return (
    <div className="flex-1 flex flex-col gap-5 items-center justify-center">
      <div className="space-y-8">
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
            <RadioGroup className="gap-2" defaultValue="1">
              <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
                <RadioGroupItem
                  value="1"
                  id={`${id}-1`}
                  aria-describedby={`${id}-1-description`}
                  className="order-1 after:absolute after:inset-0 my-auto"
                />
                <div className="flex gap-4 flex-1">
                  <div className="size-10 flex items-center justify-center">
                    <MountainSnowIcon className="size-10" />
                  </div>
                  <div className="grid grow gap-2 flex-1">
                    <Label htmlFor={`${id}-1`}>
                      The Avalanche Method{" "}
                      {/* <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                        (Interest)
                      </span> */}
                    </Label>
                    <p
                      id={`${id}-1-description`}
                      className="text-xs text-muted-foreground"
                    >
                      Pay off your highest interest debts first and work your
                      way down.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
                <RadioGroupItem
                  value="2"
                  id={`${id}-2`}
                  aria-describedby={`${id}-2-description`}
                  className="order-1 after:absolute after:inset-0 my-auto"
                />
                <div className="flex gap-4 flex-1">
                  <div className="size-10 flex items-center justify-center">
                    <SnowflakeIcon className="size-10" />
                  </div>
                  <div className="grid grow gap-2 flex-1">
                    <Label htmlFor={`${id}-2`}>
                      The Snowball Method{" "}
                      {/* <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                        (Interest)
                      </span> */}
                    </Label>
                    <p
                      id={`${id}-2-description`}
                      className="text-xs text-muted-foreground"
                    >
                      Pay off your smallest debts first and work your way up.
                    </p>
                  </div>
                </div>
              </div>
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

function generateAvalanchePlan(
  studentLoans: {
    _id: string;
    _creationTime: number;
    compounded: "daily" | "monthly" | "yearly";
    nickname: string;
    issuer: string;
    balance: number;
    apr: number;
    minimumPayment: number;
  }[],
  creditCards: {
    _id: string;
    _creationTime: number;
    compounded: "daily" | "monthly" | "yearly";
    nickname: string;
    issuer: string;
    balance: number;
    apr: number;
    has_intro_promotion: boolean;
    intro_apr: number;
    intro_expiration_timestamp: number;
    credit_limit: number;
    can_send_balance_transfer: boolean;
    can_recieve_balance_transfer: boolean;
    balance_transfer_fee: number;
    is_balance_transfer_fee_fixed: boolean;
  }[],
  monthlyRepaymentAmount: number,
) {
  return [];
}

function RepaymentPlanDisplay() {
  const studentLoans = useQuery(api.studentLoans.get) ?? [];
  const creditCards = useQuery(api.creditCards.get) ?? [];

  return <div>Repayment</div>;
}

const RepaymentPageContent = ({ user }: { user: UserResource }) => {
  const [repaymentAmount, setRepaymentAmount] = useState(1_000);
  const [hasChosenRepaymentAmount, setHasChosenRepaymentAmount] =
    useState(false);
  console.log(user);
  return (
    <MainLayout pageTitle="Repayment">
      <div className="p-4 flex-1">
        <div className="container mx-auto max-w-7xl space-y-8 flex flex-col h-full">
          {hasChosenRepaymentAmount ? (
            <div>
              <h1>Repayment</h1>
            </div>
          ) : (
            <IntroDisplay
              onSubmit={() => setHasChosenRepaymentAmount(true)}
              repaymentAmount={repaymentAmount}
              setRepaymentAmount={setRepaymentAmount}
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

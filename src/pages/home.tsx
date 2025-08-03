import LoadingSpinner from "@/components/loading-spinner";
import { NumberInput } from "@/components/number-input";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/layout/main-layout";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { FileText, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import * as Recharts from "recharts";
import useLocalStorageState from "use-local-storage-state";

import * as React from "react";
import { Pie, PieChart, Label as ReLabel } from "recharts";

import { ChartConfig, ChartTooltipContent } from "@/components/ui/chart";

type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

// Define finance types

type BankAccount = {
  id: string;
  nickname: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
};
type StudentLoan = {
  id: string;
  lender: string;
  debtRemaining: number;
  interestRate: number;
};
type CreditCard = { id: string; issuer: string; balance: number; apr: number };

function HomePageContent({ user }: { user: UserResource }) {
  const [bankAccounts, setBankAccounts] = useLocalStorageState<BankAccount[]>(
    "bankAccounts",
    { defaultValue: [] },
  );
  const [studentLoans, setStudentLoans] = useLocalStorageState<StudentLoan[]>(
    "studentLoans",
    { defaultValue: [] },
  );
  const [creditCards, setCreditCards] = useLocalStorageState<CreditCard[]>(
    "creditCards",
    { defaultValue: [] },
  );

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false);

  const [bankForm, setBankForm] = useState({
    nickname: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  });
  const [loanForm, setLoanForm] = useState({
    lender: "",
    debtRemaining: "",
    interestRate: "",
  });
  const [cardForm, setCardForm] = useState({
    issuer: "",
    balance: "",
    apr: "",
  });

  const totalStudentDebt = studentLoans.reduce(
    (sum, loan) => sum + loan.debtRemaining,
    0,
  );
  const totalCardDebt = creditCards.reduce(
    (sum, card) => sum + card.balance,
    0,
  );

  return (
    <MainLayout pageTitle="Home">
      <div className="p-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between space-x-4">
            <div className="text-2xl font-bold font-serif">
              Welcome, {user.firstName}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusIcon />
                  Connect
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsAddLoanModalOpen(true)}>
                  <FileText />
                  Add Loan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBankModalOpen(true)}>
                  Connect Bank Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsLoanModalOpen(true)}>
                  Connect Student Loan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCardModalOpen(true)}>
                  Connect Credit Card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AddLoanModal
              isOpen={isAddLoanModalOpen}
              onOpenChange={setIsAddLoanModalOpen}
            />
            {/* Bank Account Modal */}
            <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Bank Account</DialogTitle>
                  <DialogDescription>
                    Enter bank account details.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setBankAccounts([
                      ...bankAccounts,
                      { id: Date.now().toString(), ...bankForm },
                    ]);
                    setBankForm({
                      nickname: "",
                      bankName: "",
                      accountNumber: "",
                      routingNumber: "",
                    });
                    setIsBankModalOpen(false);
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={bankForm.nickname}
                        onChange={(e) =>
                          setBankForm({ ...bankForm, nickname: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankForm.bankName}
                        onChange={(e) =>
                          setBankForm({ ...bankForm, bankName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={bankForm.accountNumber}
                        onChange={(e) =>
                          setBankForm({
                            ...bankForm,
                            accountNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={bankForm.routingNumber}
                        onChange={(e) =>
                          setBankForm({
                            ...bankForm,
                            routingNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Bank</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Student Loan Modal */}
            <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Student Loan</DialogTitle>
                  <DialogDescription>Enter loan details.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStudentLoans([
                      ...studentLoans,
                      {
                        id: Date.now().toString(),
                        lender: loanForm.lender,
                        debtRemaining: Number(loanForm.debtRemaining),
                        interestRate: Number(loanForm.interestRate),
                      },
                    ]);
                    setLoanForm({
                      lender: "",
                      debtRemaining: "",
                      interestRate: "",
                    });
                    setIsLoanModalOpen(false);
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="lender">Lender</Label>
                      <Input
                        id="lender"
                        value={loanForm.lender}
                        onChange={(e) =>
                          setLoanForm({ ...loanForm, lender: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="debtRemaining">Debt Remaining</Label>
                      <Input
                        id="debtRemaining"
                        type="number"
                        value={loanForm.debtRemaining}
                        onChange={(e) =>
                          setLoanForm({
                            ...loanForm,
                            debtRemaining: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        value={loanForm.interestRate}
                        onChange={(e) =>
                          setLoanForm({
                            ...loanForm,
                            interestRate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Loan</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Credit Card Modal */}
            <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Credit Card</DialogTitle>
                  <DialogDescription>
                    Enter credit card details.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCreditCards([
                      ...creditCards,
                      {
                        id: Date.now().toString(),
                        issuer: cardForm.issuer,
                        balance: Number(cardForm.balance),
                        apr: Number(cardForm.apr),
                      },
                    ]);
                    setCardForm({ issuer: "", balance: "", apr: "" });
                    setIsCardModalOpen(false);
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="issuer">Issuer</Label>
                      <Input
                        id="issuer"
                        value={cardForm.issuer}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, issuer: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="balance">Balance</Label>
                      <Input
                        id="balance"
                        type="number"
                        value={cardForm.balance}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, balance: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="apr">APR (%)</Label>
                      <Input
                        id="apr"
                        type="number"
                        step="0.01"
                        value={cardForm.apr}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, apr: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Card</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Section */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Debt Distribution</h2>
            <ChartContainer
              id="debt-distribution"
              config={{
                studentLoans: {
                  label: "Student Loans",
                  theme: { light: "#EA580C", dark: "#F97316" },
                },
                creditCards: {
                  label: "Credit Cards",
                  theme: { light: "#2563EB", dark: "#3B82F6" },
                },
              }}
            >
              <Recharts.PieChart>
                <Recharts.Pie
                  data={[
                    { name: "Student Loans", value: totalStudentDebt },
                    { name: "Credit Cards", value: totalCardDebt },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                />
                <ChartTooltip />
                <ChartLegend />
              </Recharts.PieChart>
            </ChartContainer>
            <h2 className="text-xl font-bold">Accounts & Debts Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full caption-top text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Name/Issuer</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bankAccounts.map((acc) => (
                    <tr key={acc.id} className="border-t">
                      <td className="px-4 py-2">Bank Account</td>
                      <td className="px-4 py-2">{acc.nickname}</td>
                      <td className="px-4 py-2">-</td>
                    </tr>
                  ))}
                  {studentLoans.map((loan) => (
                    <tr key={loan.id} className="border-t">
                      <td className="px-4 py-2">Student Loan</td>
                      <td className="px-4 py-2">{loan.lender}</td>
                      <td className="px-4 py-2">
                        ${loan.debtRemaining.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {creditCards.map((card) => (
                    <tr key={card.id} className="border-t">
                      <td className="px-4 py-2">Credit Card</td>
                      <td className="px-4 py-2">{card.issuer}</td>
                      <td className="px-4 py-2">
                        ${card.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export const description = "A donut chart with text";

function ChartPieDonutText({
  balance,
  available,
}: {
  balance: number;
  available: number;
}) {
  const chartData = React.useMemo(
    () => [
      { name: "Borrowed", value: balance, fill: "var(--color-borrowed)" },
      { name: "Available", value: available, fill: "var(--color-available)" },
    ],
    [balance, available],
  );

  const total = React.useMemo(() => balance + available, [balance, available]);

  const chartConfig = React.useMemo(
    () =>
      ({
        borrowed: { label: "Borrowed", color: "var(--chart-2)" },
        available: { label: "Available", color: "var(--chart-5)" },
      }) satisfies ChartConfig,
    [],
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          <ReLabel
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Total Limit
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

type CreditCard1 = {
  id: string;
  issuer: string;
  balance: number;
  apr: number;
  has_intro_promotion: boolean;
  intro_apr: number;
  intro_expiration_date: Date;
  intro_months: number; // Deprecated
  compounded: "daily" | "monthly" | "yearly";
  credit_limit: number;
  can_send_balance_transfer: boolean;
  can_recieve_balance_transfer: boolean;
  balance_transfer_fee: number;
  is_balance_transfer_fee_fixed: boolean;
};

function CreditCardForm() {
  const [form, setForm] = useLocalStorageState<CreditCard1>(
    "add-credit-card-form",
    {
      defaultValue: {
        id: "",
        issuer: "",
        balance: 0,
        apr: 0,
        has_intro_promotion: false,
        intro_apr: 0,
        intro_expiration_date: new Date(),
        intro_months: 0, // Deprecated
        compounded: "monthly",
        credit_limit: 0,
        can_send_balance_transfer: false,
        can_recieve_balance_transfer: false,
        balance_transfer_fee: 0,
        is_balance_transfer_fee_fixed: false,
      },
    },
  );
  const [step, setStep] = useState(1);
  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return (
          form.issuer.length > 0 && form.balance > 0 && form.credit_limit > 0
        );
      case 2:
        return (
          !form.has_intro_promotion ||
          (form.intro_apr > 0 && form.intro_expiration_date > new Date())
        );
      case 3:
        return true; // No required fields beyond step 2
      default:
        return true;
    }
  }, [form, step]);
  const isValid = useMemo(() => {
    return (
      form.issuer.length > 0 &&
      form.balance > 0 &&
      form.apr > 0 &&
      form.credit_limit > 0 &&
      (!form.has_intro_promotion || form.intro_expiration_date > new Date())
    );
  }, [form]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <>
      <form className="space-y-4 py-4" onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            {/* Step 1: Basic info */}
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input
                id="issuer"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                placeholder="Ex: Chase, Citi, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Balance</Label>
              <NumberInput
                id="balance"
                value={form.balance}
                onValueChange={(value) =>
                  setForm({ ...form, balance: value ?? 0 })
                }
                thousandSeparator=","
                prefix="$ "
                min={0}
                allowNegative={false}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Credit Limit</Label>
              <NumberInput
                id="creditLimit"
                value={form.credit_limit}
                onValueChange={(value) =>
                  setForm({ ...form, credit_limit: value ?? 0 })
                }
                thousandSeparator=","
                prefix="$ "
                min={0}
                allowNegative={false}
              />
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="compounded">Compounded</Label>
                <div className="text-xs text-muted-foreground">
                  On what frequency is the interest compounded? (For credit
                  cards this usually will be monthly)
                </div>
              </div>
              <Tabs
                defaultValue="monthly"
                value={form.compounded}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    compounded: value as "daily" | "monthly" | "yearly",
                  })
                }
              >
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            {/* Step 2: Introductory promotion */}
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="hasIntroPromotion">
                  Introductory APR Promotion
                </Label>
                <div className="text-xs text-muted-foreground">
                  Does your card have a promotional APR (e.g., 0% APR for 12
                  months)? You can skip and update later if unsure.
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasIntroPromotion"
                  checked={form.has_intro_promotion}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, has_intro_promotion: checked })
                  }
                />
                <Label htmlFor="hasIntroPromotion">
                  Yes, I have a promotion
                </Label>
              </div>
            </div>
            {form.has_intro_promotion && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="introApr">Introductory APR (%)</Label>
                  <NumberInput
                    id="introApr"
                    value={form.intro_apr}
                    onValueChange={(value) =>
                      setForm({ ...form, intro_apr: value ?? 0 })
                    }
                    decimalScale={5}
                    suffix=" %"
                    allowNegative={false}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="introExpirationDate">
                    Promotion Expiration Date
                  </Label>
                  <Input
                    id="introExpirationDate"
                    type="date"
                    value={form.intro_expiration_date
                      .toISOString()
                      .slice(0, 10)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        intro_expiration_date: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="apr">APR (%)</Label>
                <div className="text-xs text-muted-foreground">
                  {form.has_intro_promotion
                    ? "What is the APR for this card after the promotion ends?"
                    : "What is the APR for this card?"}
                </div>
              </div>
              <NumberInput
                id="apr"
                value={form.apr}
                onValueChange={(value) => setForm({ ...form, apr: value ?? 0 })}
                decimalScale={5}
                suffix=" %"
                allowNegative={false}
              />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            {/* Step 3: Balance transfer options */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center space-x-2">
                <Switch
                  id="canSendBalanceTransfer"
                  checked={form.can_send_balance_transfer}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, can_send_balance_transfer: checked })
                  }
                />
                <Label htmlFor="canSendBalanceTransfer">
                  Can Send Balance Transfer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="canReceiveBalanceTransfer"
                  checked={form.can_recieve_balance_transfer}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, can_recieve_balance_transfer: checked })
                  }
                />
                <Label htmlFor="canReceiveBalanceTransfer">
                  Can Receive Balance Transfer
                </Label>
              </div>
            </div>
            {form.can_send_balance_transfer && (
              <div className="space-y-2">
                <Label htmlFor="balanceTransferFee">
                  Balance Transfer Fee (%)
                </Label>
                <NumberInput
                  id="balanceTransferFee"
                  value={form.balance_transfer_fee}
                  onValueChange={(value) =>
                    setForm({ ...form, balance_transfer_fee: value ?? 0 })
                  }
                  decimalScale={2}
                  suffix=" %"
                  allowNegative={false}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isBalanceTransferFeeFixed"
                    checked={form.is_balance_transfer_fee_fixed}
                    onCheckedChange={(checked) =>
                      setForm({
                        ...form,
                        is_balance_transfer_fee_fixed: checked,
                      })
                    }
                  />
                  <Label htmlFor="isBalanceTransferFeeFixed">
                    Is Balance Transfer Fee Fixed
                  </Label>
                </div>
              </div>
            )}
          </>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Review Your Credit Card Setup</h2>
            <div className="space-y-2">
              <p>
                <strong>Issuer:</strong> {form.issuer}
              </p>
              <p>
                <strong>Balance:</strong> ${form.balance.toLocaleString()}
              </p>
              <p>
                <strong>Credit Limit:</strong> $
                {form.credit_limit.toLocaleString()}
              </p>
              <p>
                <strong>Available Credit:</strong> $
                {(form.credit_limit - form.balance).toLocaleString()}
              </p>
              <p>
                <strong>APR:</strong> {form.apr}%
              </p>
              {form.has_intro_promotion && (
                <p>
                  <strong>Intro APR:</strong> {form.intro_apr}% until{" "}
                  {form.intro_expiration_date.toLocaleDateString()}
                </p>
              )}
              {form.can_send_balance_transfer && (
                <p>Can send balance transfers</p>
              )}
              {form.can_recieve_balance_transfer && (
                <p>Can receive balance transfers</p>
              )}
              {form.can_send_balance_transfer && (
                <p>
                  <strong>Transfer Fee:</strong> {form.balance_transfer_fee}%{" "}
                  {form.is_balance_transfer_fee_fixed
                    ? "(fixed)"
                    : "(variable)"}
                </p>
              )}
            </div>
            <div className="hidden">
              <ChartContainer
                id="card-balance-available"
                config={{
                  sborrowed: {
                    label: "Borrowed",
                    theme: { light: "red", dark: "red" },
                  },
                  savailable: {
                    label: "Available",
                    theme: { light: "green", dark: "green" },
                  },
                }}
              >
                <Recharts.PieChart width={200} height={400}>
                  <Recharts.Pie
                    data={[
                      { name: "Borrowed", value: form.balance },
                      {
                        name: "Available",
                        value: form.credit_limit - form.balance,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  />
                  <ChartTooltip />
                  <ChartLegend />
                </Recharts.PieChart>
              </ChartContainer>
            </div>
            <div className="">
              <ChartPieDonutText
                balance={form.balance}
                available={Math.max(0, form.credit_limit - form.balance)}
              />
            </div>
          </div>
        )}
      </form>
      <DialogFooter>
        {step > 1 && (
          <Button
            variant="outline"
            type="button"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        )}
        {step < 4 && (
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!isStepValid}
          >
            Next
          </Button>
        )}
        {step === 4 && (
          <Button type="submit" disabled={!isValid}>
            Submit
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

type StudentLoan1 = {
  id: string;
  nickname: string;
  issuer: string;
  balance: number;
  apr: number;
  compounded: "daily" | "monthly" | "yearly";
  minimumPayment: number;
};
function StudentLoanForm() {
  const [form, setForm] = useState<StudentLoan1>({
    id: "",
    nickname: "",
    issuer: "",
    balance: 0,
    apr: 0,
    compounded: "daily",
    minimumPayment: 0,
  });

  const isValid = useMemo(() => {
    return (
      form.nickname.length > 0 &&
      form.issuer.length > 0 &&
      form.balance > 0 &&
      form.minimumPayment > 0 &&
      form.apr > 0
    );
  }, [form]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form);
  };
  return (
    <>
      <form className="space-y-4 py-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            placeholder="Ex: Nelnet"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuer">Student Loan Issuer</Label>
          <Input
            id="issuer"
            value={form.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            placeholder="Ex: Nelnet"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance">Balance</Label>
          <NumberInput
            id="balance"
            value={form.balance}
            onValueChange={(value) => setForm({ ...form, balance: value ?? 0 })}
            thousandSeparator=","
            prefix="$ "
            min={0}
            allowNegative={false}
          />
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="minimumPayment">Minimum Payment</Label>
            <div className="text-xs text-muted-foreground">
              What is the minimum payment you need to make each month?
            </div>
          </div>
          <NumberInput
            id="minimumPayment"
            value={form.minimumPayment}
            onValueChange={(value) =>
              setForm({ ...form, minimumPayment: value ?? 0 })
            }
            thousandSeparator=","
            prefix="$ "
            placeholder="Ex: 100"
            allowNegative={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apr">APR (%)</Label>
          <NumberInput
            id="apr"
            value={form.apr}
            onValueChange={(value) => setForm({ ...form, apr: value ?? 0 })}
            decimalScale={5}
            suffix=" %"
            allowNegative={false}
          />
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="compounded">Compounded</Label>
            <div className="text-xs text-muted-foreground">
              On what frequency is the interest compounded?
            </div>
          </div>
          <Tabs
            defaultValue="daily"
            value={form.compounded}
            onValueChange={(value) =>
              setForm({
                ...form,
                compounded: value as "daily" | "monthly" | "yearly",
              })
            }
          >
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </form>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={!isValid}>
          Add Loan
        </Button>
      </DialogFooter>
    </>
  );
}

function AddLoanModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loanType, setLoanType] = useState<"student-loan" | "credit-card">(
    "student-loan",
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Loan</DialogTitle>
          <DialogDescription>Enter loan details.</DialogDescription>
        </DialogHeader>

        <Tabs
          value={loanType}
          onValueChange={(value) =>
            setLoanType(value as "student-loan" | "credit-card")
          }
        >
          <TabsList>
            <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
            <TabsTrigger value="student-loan">Student Loan</TabsTrigger>
          </TabsList>
          <TabsContent value="credit-card">
            <CreditCardForm />
          </TabsContent>
          <TabsContent value="student-loan">
            <StudentLoanForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function HomePage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <LoadingSpinner />;
  if (!user) return <RedirectToSignIn />;
  return <HomePageContent user={user} />;
}

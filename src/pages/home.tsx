import LoadingSpinner from "@/components/loading-spinner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/layout/main-layout";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { FileText, PlusIcon } from "lucide-react";
import { useState } from "react";
import * as Recharts from "recharts";
import useLocalStorageState from "use-local-storage-state";

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
            <div className="text-2xl font-bold">Welcome, {user.firstName}</div>

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

type CreditCard1 = {
  id: string;
  issuer: string;
  balance: number;
  apr: number;
  intro_apr: number;
  intro_months: number;
  fallback_apr: number;
  compounded: "daily" | "monthly" | "yearly";
  credit_limit: number;
  can_send_balance_transfer: boolean;
  can_recieve_balance_transfer: boolean;
  balance_transfer_fee: number;
  is_balance_transfer_fee_fixed: boolean;
};

function CreditCardForm() {
  return <div>credit card form</div>;
}

type StudentLoan1 = {
  id: string;
  issuer: string;
  balance: number;
  apr: number;
  compounded: "daily" | "monthly" | "yearly";
  minimumPayment: number;
};
function StudentLoanForm() {
  const [form, setForm] = useState<StudentLoan1>({
    id: "",
    issuer: "",
    balance: 0,
    apr: 0,
    compounded: "daily",
    minimumPayment: 0,
  });
  return (
    <div>
      <form>
        <div></div>
      </form>
    </div>
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
    "credit-card",
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Loan</DialogTitle>
          <DialogDescription>Enter loan details.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="credit-card"
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

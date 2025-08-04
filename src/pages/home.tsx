import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/layout/main-layout";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { CreditCardForm } from "@/components/forms/credit-card-form";
import { StudentLoanForm } from "@/components/forms/student-loan-form";
import { UserResource } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function HomePageContent({ user }: { user: UserResource }) {
  const creditCards = useQuery(api.creditCards.get) ?? [];
  const studentLoans = useQuery(api.studentLoans.get) ?? [];
  const deleteCreditCard = useMutation(api.creditCards.deleteCreditCard);
  const deleteStudentLoan = useMutation(api.studentLoans.deleteStudentLoan);

  const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false);

  const totalCardDebt = creditCards.reduce(
    (sum, card) => sum + card.balance,
    0,
  );
  const totalCardLimit = creditCards.reduce(
    (sum, card) => sum + card.credit_limit,
    0,
  );
  const totalStudentDebt = studentLoans.reduce(
    (sum, loan) => sum + loan.balance,
    0,
  );
  console.log({
    totalCardDebt,
    totalCardLimit,
    totalStudentDebt,
  });

  return (
    <MainLayout pageTitle="Home">
      <div className="p-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between space-x-4">
            <div className="text-2xl font-bold font-serif">
              Welcome, {user.firstName}
            </div>

            <Button onClick={() => setIsAddLoanModalOpen(true)}>
              <PlusIcon />
              Add Loan
            </Button>

            <AddLoanModal
              isOpen={isAddLoanModalOpen}
              onOpenChange={setIsAddLoanModalOpen}
            />
          </div>

          <div className="space-y-8">
            <h2 className="text-xl font-bold">Accounts & Debts Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full caption-top text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {studentLoans.map((loan) => (
                    <tr key={loan._id} className="border-t">
                      <td className="px-4 py-2">Student Loan</td>
                      <td className="px-4 py-2">{loan.nickname}</td>
                      <td className="px-4 py-2">
                        ${loan.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            void deleteStudentLoan({ id: loan._id })
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {creditCards.map((card) => (
                    <tr key={card._id} className="border-t">
                      <td className="px-4 py-2">Credit Card</td>
                      <td className="px-4 py-2">{card.nickname}</td>
                      <td className="px-4 py-2">
                        ${card.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            void deleteCreditCard({ id: card._id })
                          }
                        >
                          <Trash2Icon />
                        </Button>
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
            <CreditCardForm onOpenChange={onOpenChange} />
          </TabsContent>
          <TabsContent value="student-loan">
            <StudentLoanForm onOpenChange={onOpenChange} />
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

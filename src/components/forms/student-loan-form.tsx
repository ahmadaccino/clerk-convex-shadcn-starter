import { NumberInput } from "@/components/number-input";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import useLocalStorageState from "use-local-storage-state";

import * as React from "react";

import { useMutation } from "convex/react";

import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

type StudentLoan1 = {
  id: string;
  nickname: string;
  issuer: string;
  balance: number;
  apr: number;
  compounded: "daily" | "monthly" | "yearly";
  minimumPayment: number;
};
const defaultStudentLoan: StudentLoan1 = {
  id: "",
  nickname: "",
  issuer: "",
  balance: 0,
  apr: 0,
  compounded: "daily",
  minimumPayment: 0,
};

export function StudentLoanForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const createStudentLoan = useMutation(api.studentLoans.create);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useLocalStorageState<StudentLoan1>(
    "student-loan-form",
    {
      defaultValue: defaultStudentLoan,
    },
  );

  const isValid = useMemo(() => {
    return (
      form.nickname.length > 0 &&
      form.issuer.length > 0 &&
      form.balance > 0 &&
      form.minimumPayment > 0 &&
      form.apr > 0
    );
  }, [form]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const createdId = await createStudentLoan({
      nickname: form.nickname,
      issuer: form.issuer,
      balance: form.balance,
      apr: form.apr,
      compounded: form.compounded,
      minimumPayment: form.minimumPayment,
    });

    if (createdId) {
      setForm(defaultStudentLoan);
      onOpenChange(false);
      toast.success("Student loan added");
    }
    setIsLoading(false);
  };
  return (
    <>
      <form className="space-y-4 pt-4" onSubmit={(e) => void handleSubmit(e)}>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={!isValid || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Adding...
              </>
            ) : (
              "Add Loan"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

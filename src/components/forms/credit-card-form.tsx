import { NumberInput } from "@/components/number-input";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import * as Recharts from "recharts";
import useLocalStorageState from "use-local-storage-state";

import * as React from "react";
import { Pie, PieChart, Label as ReLabel } from "recharts";

import { ChartConfig, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";

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

export function CreditCardForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
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
    onOpenChange(false);
    toast.success("Credit card added");
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

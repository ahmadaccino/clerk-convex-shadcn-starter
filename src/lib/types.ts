import { useUser } from "@clerk/clerk-react";
import { Dispatch, SetStateAction } from "react";

export type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type StudentLoan = {
  _id: string;
  _creationTime: number;
  compounded: "daily" | "monthly" | "yearly";
  nickname: string;
  issuer: string;
  balance: number;
  apr: number;
  minimumPayment: number;
};

export type CreditCard = {
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
};

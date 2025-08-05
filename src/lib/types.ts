import { useUser } from "@clerk/clerk-react";
import { Dispatch, SetStateAction } from "react";
import { Doc } from "../../convex/_generated/dataModel";

export type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type StudentLoan = Doc<"studentLoans">;

export type CreditCard = Doc<"creditCards">;

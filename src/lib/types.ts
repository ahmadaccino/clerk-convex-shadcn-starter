import { useUser } from "@clerk/clerk-react";
import { Dispatch, SetStateAction } from "react";

export type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

export type SetState<T> = Dispatch<SetStateAction<T>>;

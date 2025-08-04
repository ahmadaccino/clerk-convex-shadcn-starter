import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const compounded = v.union(
  v.literal("daily"),
  v.literal("monthly"),
  v.literal("yearly"),
);

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  creditCards: defineTable({
    nickname: v.string(),
    issuer: v.string(),
    balance: v.number(),
    apr: v.number(),
    compounded,
    minimum_payment: v.number(),

    has_intro_promotion: v.boolean(),
    intro_apr: v.number(),
    intro_expiration_timestamp: v.number(),
    credit_limit: v.number(),
    can_send_balance_transfer: v.boolean(),
    can_recieve_balance_transfer: v.boolean(),
    balance_transfer_fee: v.number(),
    is_balance_transfer_fee_fixed: v.boolean(),
  }),

  studentLoans: defineTable({
    nickname: v.string(),
    issuer: v.string(),
    balance: v.number(),
    apr: v.number(),
    compounded,
    minimumPayment: v.number(),
  }),
});

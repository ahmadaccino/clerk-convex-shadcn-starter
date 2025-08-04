import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const compounded = v.union(
  v.literal("daily"),
  v.literal("monthly"),
  v.literal("yearly"),
);

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => await ctx.db.insert("creditCards", args),
});

export const get = query({
  handler: async (ctx) => await ctx.db.query("creditCards").collect(),
});

export const deleteCreditCard = mutation({
  args: {
    id: v.id("creditCards"),
  },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});

export const updateMinimumPayment = mutation({
  args: {
    id: v.id("creditCards"),
    minimum_payment: v.number(),
  },
  handler: async (ctx, args) =>
    await ctx.db.patch(args.id, { minimum_payment: args.minimum_payment }),
});

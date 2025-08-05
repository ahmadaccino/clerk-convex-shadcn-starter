import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDebtPlanParameters = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Unauthenticated call to mutation");
    }
    return await ctx.db
      .query("debtPlanParameters")
      .filter((q) => q.eq(q.field("user_id"), identity.email))
      .first();
  },
});

export const createDebtPlanParameters = mutation({
  args: {
    minimum_payment: v.number(),
    strategy: v.union(
      v.literal("cascade"),
      v.literal("avalanche"),
      v.literal("snowball"),
    ),
    preserve_credit_score: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null || identity.email === undefined) {
      throw new Error("Unauthenticated call to mutation");
    }
    return await ctx.db.insert("debtPlanParameters", {
      user_id: identity.email,
      minimum_payment: args.minimum_payment,
      strategy: args.strategy,
      preserve_credit_score: args.preserve_credit_score,
    });
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    nickname: v.string(),
    issuer: v.string(),
    balance: v.number(),
    apr: v.number(),
    compounded: v.union(
      v.literal("daily"),
      v.literal("monthly"),
      v.literal("yearly"),
    ),
    minimumPayment: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null || identity.email === undefined) {
      throw new Error("Unauthenticated call to mutation");
    }
    const id = await ctx.db.insert("studentLoans", {
      ...args,
      user_id: identity.email,
    });
    return id;
  },
});

export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null || identity.email === undefined) {
      throw new Error("Unauthenticated call to mutation");
    }
    return await ctx.db
      .query("studentLoans")
      .filter((q) => q.eq(q.field("user_id"), identity.email))
      .collect();
  },
});

export const deleteStudentLoan = mutation({
  args: {
    id: v.id("studentLoans"),
  },
  handler: async (ctx, args) => await ctx.db.delete(args.id),
});

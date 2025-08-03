import { v } from "convex/values";
import { mutation } from "./_generated/server";

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
    const id = await ctx.db.insert("studentLoans", args);
    return id;
  },
});

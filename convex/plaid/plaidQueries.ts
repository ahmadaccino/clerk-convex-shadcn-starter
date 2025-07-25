// import { v } from "convex/values";
// import { query } from "../_generated/server";
// import { plaidClient } from "./plaid-client";

// // Fetch accounts and balances
// export const getAccounts = query({
//   args: { userId: v.string() },
//   handler: async (ctx, args) => {
//     const tokenDoc = await ctx.db
//       .query("plaidTokens")
//       .filter((q) => q.eq(q.field("userId"), args.userId))
//       .first();
//     if (!tokenDoc) return [];
//     const response = await plaidClient.accountsGet({
//       access_token: tokenDoc.accessToken,
//     });
//     return response.data.accounts.map((acct) => ({
//       name: acct.name,
//       official_name: acct.official_name,
//       subtype: acct.subtype,
//       balances: acct.balances,
//     }));
//   },
// });

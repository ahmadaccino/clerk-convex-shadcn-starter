// import { v } from "convex/values";
// import { action } from "../_generated/server";

// // If you want to use the Plaid Node SDK, add "use node"; at the top of the file
// // "use node";
// import { api } from "../_generated/api";
// import { plaidClient } from "./plaid-client";

// export const fetchPlaidAccounts = action({
//   args: { userId: v.string() },
//   handler: async (ctx, args) => {
//     // Get access_token from your DB
//     const tokenDoc = await ctx.runQuery(api.plaid.plaidActions.getPlaidToken, {
//       userId: args.userId,
//     });
//     if (!tokenDoc) throw new Error("No Plaid token found");

//     // Fetch accounts from Plaid
//     const response = await plaidClient.accountsGet({
//       access_token: tokenDoc.accessToken,
//     });

//     return response.data.accounts.map((acct) => ({
//       name: acct.name,
//       official_name: acct.official_name,
//       balances: acct.balances,
//     }));
//   },
// });

// export const exchangePublicToken = action({
//   args: { publicToken: v.string(), userId: v.string() },
//   handler: async (ctx, args) => {
//     // Call Plaid API to exchange public_token for access_token
//     const response = await plaidClient.itemPublicTokenExchange({
//       public_token: args.publicToken,
//     });

//     // Store access_token in your Convex database
//     await ctx.runMutation(api.plaid.plaidActions.savePlaidToken, {
//       userId: args.userId,
//       accessToken: response.data.access_token,
//       itemId: response.data.item_id,
//     });

//     return { success: true };
//   },
// });

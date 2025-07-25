// import { httpAction } from "../_generated/server";
// import { plaidClient } from "./plaid-client";

// export const doSomething = httpAction(async (ctx, req) => {
//   const { userId } = JSON.parse(req.body);
//   const response = await plaidClient.linkTokenCreate({
//     user: { client_user_id: userId },
//     client_name: "Your App Name",
//     products: ["auth", "transactions"],
//     country_codes: ["US"],
//     language: "en",
//   });
//   return new Response(
//     { link_token: response.data.link_token },
//     {
//       status: 200,
//     },
//   );
// });

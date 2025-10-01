const authConfig = {
  providers: [
    // Uncomment this once you have set up a Clerk app
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.VITE_CLERK_FRONTEND_API_URL`
      // and configure VITE_CLERK_FRONTEND_API_URL on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.VITE_CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ],
};

export default authConfig;

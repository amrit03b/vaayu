import { createCivicAuthPlugin } from "@civic/auth/nextjs";

const nextConfig = {
  /* your existing config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "5cefdb7e-d5b2-442a-a7c2-997c06c788cf",
  loginSuccessUrl: "/dashboard" // Redirect to your dashboard page after login
});

export default withCivicAuth(nextConfig);
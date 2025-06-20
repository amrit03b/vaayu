import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

const withCivicAuth = createCivicAuthPlugin({
  clientId: "5cefdb7e-d5b2-442a-a7c2-997c06c788cf",
  redirectUri: "/dashboard"
});

export default withCivicAuth(nextConfig);
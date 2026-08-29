"use client";

import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  adminClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.BETTER_AUTH_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"),
  plugins: [magicLinkClient(), adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

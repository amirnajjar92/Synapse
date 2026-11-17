"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Most pages identify the user from localStorage (`synapse_user` / `synapse_token`).
 * Google sign-in goes through NextAuth, so mirror the NextAuth session into
 * localStorage. After a fresh sign-in we reload once so pages that read
 * localStorage on mount pick the user up.
 */
export default function AuthSessionBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    try {
      const stored = localStorage.getItem("synapse_user");
      const storedEmail = stored ? JSON.parse(stored)?.email : null;
      const hadToken = !!localStorage.getItem("synapse_token");

      if (storedEmail === session.user.email && hadToken) return;

      localStorage.setItem(
        "synapse_user",
        JSON.stringify({
          email: session.user.email,
          name: session.user.name ?? session.user.email.split("@")[0],
          picture: session.user.image ?? null,
        })
      );
      localStorage.setItem("synapse_token", "nextauth");

      window.location.reload();
    } catch (error) {
      console.error("Could not sync sign-in session:", error);
    }
  }, [session, status]);

  return null;
}

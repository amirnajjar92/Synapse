"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Google Identity Services type declaration
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const SYNAPSE_BACKEND_URL = "https://moole-back.vercel.app"; // Replace with your actual backend URL

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testLoading, setTestLoading] = useState(false);

  // Check if user is already signed in
  useEffect(() => {
    const token = localStorage.getItem("synapse_token");
    if (token) {
      router.push("/planner");
    }
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Check if Google Identity Services are available
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        initializeGoogleGSI();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeGoogleGSI();
      };

      script.onerror = () => {
        console.error("Failed to load Google Identity Services");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setIsLoading(false);
    }
  };

  const initializeGoogleGSI = () => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: "763002332533-9fk3gd611c2etmdfdmu3bhlu7u7uosaj.apps.googleusercontent.com", // Synapse Google Client ID
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt();
  };

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      // Send ID token to our Synapse backend endpoint
      const backendResponse = await fetch(`${SYNAPSE_BACKEND_URL}/api/synapse/auth/google/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: response.credential
        }),
      });

      const data = await backendResponse.json();

      if (backendResponse.ok) {
        // Store token and user info in localStorage
        localStorage.setItem("synapse_token", data.token);
        localStorage.setItem("synapse_user", JSON.stringify({
          email: data.email,
          name: data.name,
          picture: data.picture
        }));

        // Now call our Synapse API to save the user to our Postgres DB
        const synapseUserResponse = await fetch('/api/users/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            name: data.name,
            picture: data.picture
          })
        });

        if (!synapseUserResponse.ok) {
          console.error('Failed to save user to Synapse DB');
        }

        router.push("/planner");
      } else {
        console.error("Backend authentication failed:", data.error);
        alert("Sign in failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during Google authentication:", error);
      alert("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    try {
      // For test sign-in, store a test token and user
      localStorage.setItem("synapse_token", "test_token_" + Date.now());
      localStorage.setItem("synapse_user", JSON.stringify({
        email: testEmail,
        name: "Test User",
        picture: null
      }));

      // Also save test user to Synapse DB
      const synapseUserResponse = await fetch('/api/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          name: "Test User",
          picture: null
        })
      });

      if (!synapseUserResponse.ok) {
        console.error('Failed to save test user to Synapse DB');
      }

      router.push("/planner");
    } catch (error) {
      console.error("Test sign in error:", error);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[#151515]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center">
        <h1 className="text-4xl font-bold text-white">Welcome to Synapse</h1>
        <p className="text-lg text-gray-400">
          Sign in to create your personalized fitness plan</p>
        <button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.72 1 10.3 1 12c0 1.7.43 3.28 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>

        <div className="text-white/50 my-4">or</div>

        <form onSubmit={handleTestSignIn} className="flex flex-col gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email"
            className="px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            disabled={testLoading}
            className="flex items-center justify-center gap-3 bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testLoading ? "Signing in..." : "Test Sign In"}
          </button>
        </form>
      </main>
    </div>
  );
}

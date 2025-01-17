"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function StoreApiKeyForm() {
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Stored API key status:", hasStoredKey);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch("/api/check-api-key", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setHasStoredKey(data.hasKey);
      }
    } catch (error) {
      console.error("Error checking API key status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/store-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: newApiKey }),
        credentials: "include",
      });

      if (response.ok) {
        setNewApiKey("");
        await checkApiKeyStatus();
      } else {
        throw new Error("Failed to store API key");
      }
    } catch (error) {
      console.error("Error details:", error);
      alert("Error storing API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearApiKey = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/store-api-key", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await checkApiKeyStatus();
      } else {
        throw new Error("Failed to clear API key");
      }
    } catch (error) {
      console.error("Error clearing API key:", error);
      alert("Error clearing API key");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        {hasStoredKey ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span>API key is stored and encrypted</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <span>No API key stored</span>
          </div>
        )}
      </div>

      {hasStoredKey ? (
        <div>
          <Button
            variant="destructive"
            onClick={handleClearApiKey}
            disabled={isLoading}
          >
            Clear Stored API Key
          </Button>
        </div>
      ) : (
        <form onSubmit={handleStoreApiKey} className="space-y-4">
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter new OpenAI API key"
              className="w-full px-3 py-2 pr-10 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showApiKey ? (
                <svg
                  className="h-6 w-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            Store API Key
          </Button>
        </form>
      )}
    </div>
  );
}

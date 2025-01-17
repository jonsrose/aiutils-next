"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";

export function SettingsForm() {
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [hasStoredKey, setHasStoredKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
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

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          OpenAI API Key
        </h2>
        <div className="space-y-6">
          <div className="prose dark:prose-invert">
            <p className="text-sm text-muted-foreground">
              To use AI features, you need to provide your OpenAI API key. You
              can get one from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                OpenAI&apos;s website
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking API key status...</span>
              </div>
            ) : hasStoredKey ? (
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
            <Button
              variant="destructive"
              onClick={handleClearApiKey}
              disabled={isLoading}
            >
              Clear API Key
            </Button>
          ) : (
            <form onSubmit={handleStoreApiKey}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="openai-api-key"
                      type={showApiKey ? "text" : "password"}
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="Enter your OpenAI API key"
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Save API Key
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {mounted && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Theme Settings
          </h2>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </>
  );
}

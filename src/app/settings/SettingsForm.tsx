'use client';

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";

export function SettingsForm() {
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStoreApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert("API key stored successfully");
        setNewApiKey("");
      } else {
        throw new Error("Failed to store API key");
      }
    } catch (error) {
      console.error("Error details:", error);
      alert("Error storing API key");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg border p-4">
        <form onSubmit={handleStoreApiKey}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                className="text-lg font-semibold mb-4"
                 htmlFor="openai-api-key"
              >
                OpenAI API Key
              </Label>
              <div className="relative">
                <Input
                  id="openai-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="pr-10"
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
            <Button type="submit" className="w-full">
              Save API Key
            </Button>
          </div>
        </form>
        <p className="text-sm text-muted-foreground mt-4">
          Your API key will be encrypted before storage for security.
        </p>
      </div>

      {mounted && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
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
    </div>
  );
} 
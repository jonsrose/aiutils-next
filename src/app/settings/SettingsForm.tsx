'use client';

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export function SettingsForm() {
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

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
    <form onSubmit={handleStoreApiKey}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openai-api-key">OpenAI API Key</Label>
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
  );
} 
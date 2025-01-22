// src/app/recipe-refiner/page.tsx

"use client";

import React, { useState, useCallback } from "react";
import { Recipe } from "@/types";
import RecipeComponent from "@/components/RecipeComponent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withAuth } from "@/components/withAuth";
import { useQueryClient } from "@tanstack/react-query";
import debounce from "lodash/debounce";

const RecipeImportPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [recipeName, setRecipeName] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [rawRecipe, setRawRecipe] = useState("");
  const [model, setModel] = useState("gpt-4-turbo");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<{
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    costInCents?: number;
  } | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlContent, setUrlContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [isUrlFetching, setIsUrlFetching] = useState(false);
  const [lastFetchedUrl, setLastFetchedUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecipe(null);
    setUsage(null);

    try {
      const response = await fetch("/api/refine-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeName,
          recipeUrl,
          rawRecipe,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Recipe data received:", data.recipe);
      setRecipe(data.recipe);
      setUsage(data.usage);
      setCurrentStep(2); // Move to step 2 after successful import
    } catch (error) {
      console.error(error);
      console.error("Failed to refine the recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;

    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipe }),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["recipes"] });
        alert("Recipe saved successfully!");
        router.push("/recipe-helper");
      } else {
        const errorData = await response.json();
        alert(`Failed to save recipe: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("An error occurred while saving the recipe.");
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setRecipe(null);
  };

  const fetchUrlContent = async (url: string) => {
    if (!url || url === lastFetchedUrl || !isValidUrl(url)) return;

    setIsUrlFetching(true);
    try {
      const response = await fetch("/api/fetch-recipe-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Failed to fetch URL content");

      const data = await response.json();
      setUrlContent(data);
      setLastFetchedUrl(url);
      setShowUrlModal(true);
    } catch (error) {
      console.error("Error fetching URL content:", error);
    } finally {
      setIsUrlFetching(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Debounced version of fetchUrlContent
  const debouncedFetchUrl = useCallback(
    debounce((url: string) => fetchUrlContent(url), 500),
    []
  );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRecipeUrl(url);

    if (!recipeName && !rawRecipe) {
      debouncedFetchUrl(url);
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const url = e.clipboardData.getData("text");
    if (!recipeName && !rawRecipe) {
      fetchUrlContent(url);
    }
  };

  const handleUrlBlur = () => {
    if (recipeUrl && !recipeName && !rawRecipe) {
      fetchUrlContent(recipeUrl);
    }
  };

  const handleImportConfirm = () => {
    if (urlContent) {
      setRecipeName(urlContent.title);
      setRawRecipe(urlContent.content);
    }
    setShowUrlModal(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe Import</h1>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`step-circle ${currentStep >= 1 ? "active" : ""}`}>
            1
          </div>
          <div className="step-line"></div>
          <div className={`step-circle ${currentStep >= 2 ? "active" : ""}`}>
            2
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-sm text-gray-600">
            {currentStep === 1 ? "Enter Recipe Details" : "Review and Save"}
          </span>
        </div>
      </div>

      {currentStep === 1 && (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="recipeUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Recipe URL (Optional):
              </label>
              <input
                id="recipeUrl"
                value={recipeUrl}
                onChange={handleUrlChange}
                onPaste={handleUrlPaste}
                onBlur={handleUrlBlur}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="https://example.com/recipe"
              />
              {isUrlFetching && (
                <p className="text-sm text-gray-500 mt-1">
                  Fetching content...
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="recipeName"
                className="block text-sm font-medium text-gray-700"
              >
                Recipe Name:
              </label>
              <input
                id="recipeName"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="rawRecipe"
                className="block text-sm font-medium text-gray-700"
              >
                Paste Your Recipe:
              </label>
              <textarea
                id="rawRecipe"
                value={rawRecipe}
                onChange={(e) => setRawRecipe(e.target.value)}
                required
                rows={6}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Please paste your complete recipe here, including both the ingredients list and cooking steps..."
              />
            </div>
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700"
              >
                Select GPT Model:
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              >
                <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4-Turbo</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex-1"
              >
                {isLoading ? "Processing..." : "Import"}
              </button>
              <Link
                href="/recipe-helper"
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-center flex-1"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* URL Import Modal */}
          {showUrlModal && urlContent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Import Recipe Content?
                </h3>
                <p className="text-gray-600 mb-4">
                  Would you like to import content from this URL?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowUrlModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-700">Importing your recipe...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 2 && recipe && (
        <div className="flex flex-col min-h-[calc(100vh-12rem)]">
          <div className="flex-1 space-y-6 mb-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                Review Your Recipe
              </h2>
              <RecipeComponent recipe={recipe} effectiveStartTime={null} />
            </div>

            {usage && (
              <div className="text-xs border dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                  API Usage
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Prompt:
                    </span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                      {usage.promptTokens} tokens
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Completion:
                    </span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                      {usage.completionTokens} tokens
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Total:
                    </span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                      {usage.totalTokens} tokens
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Cost:
                    </span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                      ${((usage.costInCents ?? 0) / 100).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700">
            <div className="container mx-auto flex gap-4">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex-1"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSaveRecipe}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex-1"
              >
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .step-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .step-circle.active {
          background-color: #3b82f6;
          color: white;
        }
        .step-line {
          height: 2px;
          width: 100px;
          background-color: #e5e7eb;
          margin: 0 10px;
        }
      `}</style>
    </div>
  );
};

export default withAuth(RecipeImportPage);

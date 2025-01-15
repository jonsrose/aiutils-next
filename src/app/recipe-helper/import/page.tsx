// src/app/recipe-refiner/page.tsx

"use client";

import React, { useState } from "react";
import { Recipe } from "@/types";
import RecipeComponent from "@/components/RecipeComponent";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RecipeImportPage = () => {
  const router = useRouter();
  const [recipeName, setRecipeName] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [rawRecipe, setRawRecipe] = useState("");
  const [model, setModel] = useState("gpt-4-turbo");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecipe(null);

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe Import</h1>
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
            onChange={(e) => setRecipeUrl(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
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
            placeholder="Enter your recipe here..."
          ></textarea>
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
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {isLoading ? "Refining..." : "Import Recipe"}
          </button>
          <Link
            href="/recipe-helper"
            className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 inline-block"
          >
            Cancel
          </Link>
        </div>
      </form>

      {recipe && (
        <div className="mt-6 p-6 rounded-lg shadow-md max-h-[300px] overflow-y-auto bg-white">
          <RecipeComponent recipe={recipe} effectiveStartTime={null} />
        </div>
      )}

      {recipe && (
        <div className="mt-6 mb-6">
          <button
            onClick={handleSaveRecipe}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 w-full md:w-auto"
          >
            Save Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeImportPage;

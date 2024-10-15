// src/app/recipe-refiner/page.tsx

"use client";

import React, { useState, useRef } from 'react';
import { RefineRecipeResponse } from '../../types';
import Link from 'next/link';

const RecipeRefinerPage = () => {
  const [recipe, setRecipe] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [readyTime, setReadyTime] = useState('');
  const [refinedRecipeText, setRefinedRecipeText] = useState('');
  const [refinedRecipe, setRefinedRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRefinedRecipeText('');
    setRefinedRecipe(null);
    setWordCount(0);

    try {
      const response = await fetch('/api/refine-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe,
          model,
          readyTime: readyTime || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: RefineRecipeResponse = await response.json();

      setRefinedRecipe(data.jsonOutput);
      setRefinedRecipeText(data.textOutput);
      setWordCount(data.textOutput.split(/\s+/).length);
    } catch (error: any) {
      console.error(error);
      console.error('Failed to refine the recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand('copy');
      console.log('Copied to clipboard!');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe Refiner</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipe" className="block text-sm font-medium text-gray-700">
            Paste Your Raw Recipe:
          </label>
          <textarea
            id="recipe"
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            required
            rows={6}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            placeholder="Enter your recipe here..."
          ></textarea>
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="readyTime" className="block text-sm font-medium text-gray-700">
            Ready Time (Optional, in minutes):
          </label>
          <input
            type="number"
            id="readyTime"
            value={readyTime}
            onChange={(e) => setReadyTime(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
            placeholder="e.g., 30"
            min="1"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {isLoading ? 'Refining...' : 'Refine Recipe'}
          </button>
        </div>
      </form>

      {isLoading && <Loading />}

      {refinedRecipeText && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Refined Recipe (Text)</h2>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={refinedRecipeText}
              readOnly
              rows={10}
              className="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Copy
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600">Word Count: {wordCount}</p>
        </div>
      )}

      {refinedRecipe && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Refined Recipe (JSON)</h2>
          <pre className="p-2 bg-gray-100 rounded-md overflow-auto">
            {JSON.stringify(JSON.parse(refinedRecipe), null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default RecipeRefinerPage;

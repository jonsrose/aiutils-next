// src/app/recipe-refiner/page.tsx

"use client";

import React, { useState, useRef } from 'react';
import { Recipe } from '../../types';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const RecipeRefinerPage = () => {
  const [rawRecipe, setRawRecipe] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [readyTime, setReadyTime] = useState<Date | null>(null);
  const [refinedRecipeText, setRefinedRecipeText] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRefinedRecipeText('');
    setRecipe(null);
    setWordCount(0);

    try {
      const response = await fetch('/api/refine-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawRecipe,
          model,
          readyTime: readyTime ? readyTime.toTimeString().slice(0, 5) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const recipe: Recipe = await response.json();

      setRecipe(recipe);
    } catch (error) {
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
          <label htmlFor="rawRecipe" className="block text-sm font-medium text-gray-700">
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
            Ready Time (Optional):
          </label>
          <DatePicker
            id="readyTime"
            selected={readyTime}
            onChange={(date: Date | null) => setReadyTime(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
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

      {/* TODO {isLoading && <Loading />} */}

      {recipe && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Refined Recipe (JSON)</h2>
          <pre className="p-2 bg-gray-100 rounded-md overflow-auto">
            {JSON.stringify(recipe, null, 2)}
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

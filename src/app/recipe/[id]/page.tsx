"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import RecipeComponent from '../../../components/RecipeComponent';
import { Recipe } from '../../../types';

const RecipePage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isChecklist, setIsChecklist] = useState(true);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const effectiveStartTime = useMemo(() => {
    if (startTime) {
      return startTime;
    } else if (endTime && recipe?.total_time_minutes) {
      // Derive start time by subtracting total time from end time
      const endDate = new Date(endTime);
      endDate.setMinutes(endDate.getMinutes() - recipe.total_time_minutes);
      return endDate;
    }
    // Return null if neither startTime nor endTime is set
    return null;
  }, [startTime, endTime, recipe?.total_time_minutes]);

  const hasCheckedItems = Object.values(checkedItems).some(value => value);

  const clearChecklist = () => {
    setCheckedItems({});
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipe');
        }
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Set Recipe Time</h2>
        {!startTime && !endTime ? (
          <div className="flex items-center space-x-4">
            <DatePicker
              selected={selectedTime}
              onChange={(time: Date | null) => setSelectedTime(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              className="border rounded px-2 py-1"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setStartTime(selectedTime)}
            >
              Set as Start Time
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => setEndTime(selectedTime)}
            >
              Set as End Time
            </button>
          </div>
        ) : (
          <div>
            {startTime && <p>Starting at {startTime.toLocaleTimeString()}</p>}
            {endTime && <p>Ending at {endTime.toLocaleTimeString()}</p>}
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => {
                setStartTime(null);
                setEndTime(null);
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="mb-4 flex items-center">
        <label htmlFor="isChecklist" className="mr-2">Show as checklist:</label>
        <input
          type="checkbox"
          id="isChecklist"
          checked={isChecklist}
          onChange={(e) => setIsChecklist(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
      </div>

      {isChecklist && (
        <button
          onClick={clearChecklist}
          disabled={!hasCheckedItems}
          className={`mb-4 px-4 py-2 rounded ${
            hasCheckedItems
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Clear Checklist
        </button>
      )}

      <RecipeComponent 
        recipe={recipe} 
        effectiveStartTime={effectiveStartTime} 
        isChecklist={isChecklist}
        checkedItems={checkedItems}
        setCheckedItems={setCheckedItems}
      />

      <div className="mt-6">
        <Link href="/recipe-list" className="text-blue-500 hover:underline">
          &larr; Back to Recipe List
        </Link>
      </div>
    </div>
  );
};

export default RecipePage;

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import RecipeComponent from '../../../../components/RecipeComponent';
import { Recipe } from '../../../../types';
import { generateMarkdown } from '../../../../utils/markdownGenerator';

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

  const copyToClipboard = () => {
    if (recipe) {
      const markdown = generateMarkdown(recipe, isChecklist, checkedItems, effectiveStartTime);
      navigator.clipboard.writeText(markdown)
        .then(() => alert('Recipe copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    }
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
    <div className="container mx-auto p-4 space-y-8">
      <div className="max-w-3xl mx-auto bg-card rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recipe Settings</h2>
        
        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-3">Timing Options</h3>
            {!startTime && !endTime ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <DatePicker
                  selected={selectedTime}
                  onChange={(time: Date | null) => setSelectedTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full sm:w-auto border rounded-md px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => setStartTime(selectedTime)}
                  >
                    Set Start Time
                  </button>
                  <button
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => setEndTime(selectedTime)}
                  >
                    Set End Time
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {startTime && (
                    <p className="text-sm">Starting at: <span className="font-medium">{startTime.toLocaleTimeString()}</span></p>
                  )}
                  {endTime && (
                    <p className="text-sm">Ending at: <span className="font-medium">{endTime.toLocaleTimeString()}</span></p>
                  )}
                </div>
                <button
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
                  onClick={() => {
                    setStartTime(null);
                    setEndTime(null);
                  }}
                >
                  Clear Times
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isChecklist"
                checked={isChecklist}
                onChange={(e) => setIsChecklist(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isChecklist" className="text-sm font-medium">
                Show as checklist
              </label>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Copy to Clipboard
              </button>
              
              {isChecklist && (
                <button
                  onClick={clearChecklist}
                  disabled={!hasCheckedItems}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    hasCheckedItems
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Clear Checklist
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <RecipeComponent 
        recipe={recipe} 
        effectiveStartTime={effectiveStartTime} 
        isChecklist={isChecklist}
        checkedItems={checkedItems}
        setCheckedItems={setCheckedItems}
      />

      <div className="max-w-3xl mx-auto mt-8">
        <Link 
          href="/recipe-helper" 
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <span className="mr-2">←</span> Back to Recipe Helper
        </Link>
      </div>
    </div>
  );
};

export default RecipePage;

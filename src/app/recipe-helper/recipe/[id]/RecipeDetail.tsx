"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RecipeComponent from "@/components/RecipeComponent";
import { generateMarkdown } from "@/utils/markdownGenerator";
import { useRecipe } from "@/hooks/useRecipe";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Settings2,
  ArrowLeft,
  ClipboardCopy,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

interface RecipeDetailProps {
  id: string;
}

async function deleteRecipe(id: string): Promise<void> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete recipe");
  }
}

export function RecipeDetail({ id }: RecipeDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: recipe, isLoading } = useRecipe(id);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isChecklist, setIsChecklist] = useState(true);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const effectiveStartTime = useMemo(() => {
    if (startTime) {
      return startTime;
    } else if (endTime && recipe?.total_time_minutes) {
      const endDate = new Date(endTime);
      endDate.setMinutes(endDate.getMinutes() - recipe.total_time_minutes);
      return endDate;
    }
    return null;
  }, [startTime, endTime, recipe?.total_time_minutes]);

  const hasCheckedItems = Object.values(checkedItems).some((value) => value);

  const clearChecklist = () => {
    setCheckedItems({});
  };

  const copyToClipboard = () => {
    if (recipe) {
      const markdown = generateMarkdown(
        recipe,
        isChecklist,
        checkedItems,
        effectiveStartTime
      );
      navigator.clipboard
        .writeText(markdown)
        .then(() => alert("Recipe copied to clipboard!"))
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(id);
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      router.push("/recipe-helper");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="container mx-auto p-4 space-y-8 mb-16">
      <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link
            href="/recipe-helper"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            My Recipes
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="hover:bg-primary/10"
              title="Copy to Clipboard"
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
            {isChecklist && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearChecklist}
                disabled={!hasCheckedItems}
                className="hover:bg-primary/10"
                title="Clear Checklist"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettingsDialog(true)}
              className="hover:bg-primary/10"
              title="Settings"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
              title="Delete Recipe"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="pt-24">
        <RecipeComponent
          recipe={recipe}
          effectiveStartTime={effectiveStartTime}
          isChecklist={isChecklist}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
        />

        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recipe Settings</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Timing Options</h3>
                {!startTime && !endTime ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <DatePicker
                        selected={selectedTime}
                        onChange={(time: Date | null) => setSelectedTime(time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="w-full border rounded-md px-3 py-2"
                        open={isTimePickerOpen}
                        onInputClick={() => setIsTimePickerOpen(true)}
                        onClickOutside={() => setIsTimePickerOpen(false)}
                        shouldCloseOnEsc
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => setStartTime(selectedTime)}
                      >
                        Set Start Time
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setEndTime(selectedTime)}
                      >
                        Set End Time
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      {startTime && (
                        <p className="text-sm">
                          Starting at:{" "}
                          <span className="font-medium">
                            {startTime.toLocaleTimeString()}
                          </span>
                        </p>
                      )}
                      {endTime && (
                        <p className="text-sm">
                          Ending at:{" "}
                          <span className="font-medium">
                            {endTime.toLocaleTimeString()}
                          </span>
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setStartTime(null);
                        setEndTime(null);
                      }}
                    >
                      Clear Times
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Display Options</h3>
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
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Recipe</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete &quot;{recipe.name}&quot;? This
              action cannot be undone.
            </p>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

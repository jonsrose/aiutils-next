"use client";

import React, { useState, useRef } from "react";
import { withAuth } from "@/components/withAuth";

function SpeechToTextPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    durationInMinutes?: number;
    costInCents?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an audio file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUsage(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setWordCount(data.transcription.split(/\s+/).length);
      setUsage(data.usage);
      setCurrentStep(2);
    } catch (err) {
      console.error("Error during transcription:", err);
      setError("An error occurred during transcription");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    alert("Copied to clipboard");
  };

  const handleBack = () => {
    setCurrentStep(1);
    setTranscription("");
    setWordCount(0);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Speech to Text</h1>

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
            {currentStep === 1 ? "Upload Audio" : "Review Transcription"}
          </span>
        </div>
      </div>

      {currentStep === 1 && (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="audioFile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Audio File:
              </label>
              <input
                id="audioFile"
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/mpeg,.mp3,.wav,.m4a,.aac"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors flex-1"
              >
                {isLoading ? "Transcribing..." : "Transcribe"}
              </button>
            </div>
          </form>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-700 dark:text-gray-200">
                  Transcribing audio...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 2 && transcription && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-h-[60vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Transcription Result
            </h2>
            <p className="mb-4 dark:text-gray-200">{transcription}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Word count: {wordCount}
            </p>
          </div>

          {usage && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium mb-2 dark:text-white">
                API Usage Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Duration:
                  </span>
                  <span className="ml-2 font-medium dark:text-white">
                    {usage.durationInMinutes?.toFixed(2)} minutes
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Cost:
                  </span>
                  <span className="ml-2 font-medium dark:text-white">
                    ${((usage.costInCents ?? 0) / 100).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 sticky bottom-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex-1"
            >
              New Transcription
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex-1"
            >
              Copy to Clipboard
            </button>
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
}

export default withAuth(SpeechToTextPage);

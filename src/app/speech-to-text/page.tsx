"use client";

import React, { useState, useRef } from "react";
import { withAuth } from "@/components/withAuth";

function SpeechToTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Speech to Text</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="file"
          accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/mpeg,.mp3,.wav,.m4a,.aac"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="mb-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          {isLoading ? "Transcribing..." : "Transcribe"}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {transcription && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Transcription:</h2>
          <p className="mb-2">{transcription}</p>
          <p className="mb-2">Word count: {wordCount}</p>
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default withAuth(SpeechToTextPage);

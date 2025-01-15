"use client";

import React from "react";
import Link from "next/link";
import { withAuth } from "@/components/withAuth";

function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Getting Started with AI Utils</h1>

      <div className="space-y-8 max-w-3xl">
        {/* Step 1 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              1
            </div>
            <h2 className="text-xl font-semibold">Create an Account</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Start by creating an account or signing in:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Click the Sign In button on the homepage</li>
            <li>Choose your preferred authentication method</li>
            <li>Complete the authentication process</li>
          </ul>
          <div className="mt-4">
            <Link
              href="/signin"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Go to Sign In →
            </Link>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              2
            </div>
            <h2 className="text-xl font-semibold">
              Set Up Your OpenAI API Key
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            To use our AI-powered features, you'll need an OpenAI API key:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Get your API key from OpenAI's website</li>
            <li>Go to Settings in AI Utils</li>
            <li>Enter and save your API key (it will be securely encrypted)</li>
          </ul>
          <div className="mt-4">
            <Link
              href="/settings"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Go to Settings →
            </Link>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              3
            </div>
            <h2 className="text-xl font-semibold">Start Using Features</h2>
          </div>
          <p className="text-gray-600 mb-4">
            You're now ready to use our AI-powered features:
          </p>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Recipe Helper</h3>
              <p className="text-gray-600 mb-2">
                Import and organize your recipes with AI assistance:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Import recipes from URLs or text</li>
                <li>AI will structure and format your recipes</li>
                <li>Save and manage your recipe collection</li>
              </ul>
              <Link
                href="/recipe-helper"
                className="text-blue-500 hover:text-blue-600 font-medium block mt-3"
              >
                Try Recipe Helper →
              </Link>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Speech to Text</h3>
              <p className="text-gray-600 mb-2">
                Convert audio recordings to text:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Upload audio files (MP3, WAV, M4A, AAC)</li>
                <li>Get accurate text transcriptions</li>
                <li>Copy and use the transcribed text</li>
              </ul>
              <Link
                href="/speech-to-text"
                className="text-blue-500 hover:text-blue-600 font-medium block mt-3"
              >
                Try Speech to Text →
              </Link>
            </div>
          </div>
        </div>

        {/* Need Help? */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
          <p className="text-gray-600">
            If you need assistance or have questions, check out our
            documentation or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HelpPage);

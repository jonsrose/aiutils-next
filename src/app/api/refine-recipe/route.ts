// src/app/api/refine-recipe/route.ts

import { NextResponse } from 'next/server';
import { Recipe } from '../../../types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from 'openai';
import { getDecryptedApiKey } from '@/utils/cryptoUtils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const email = session.user.email;
    const decryptedApiKey = await getDecryptedApiKey(email);

    if (!decryptedApiKey) {
      return new NextResponse('OpenAI API key not found or failed to decrypt', { status: 400 });
    }

    const openai = new OpenAI({ apiKey: decryptedApiKey });

    // Parse the request body to extract name, recipe, model,
    const { recipeName, recipeUrl, rawRecipe, model } = await req.json();

    // Construct the prompt
    const prompt = `
    A recipe name, optional recipe URL, and recipe is attached, copied from a web page. Your task is to create a cleaned-up recipe that is easier to follow and return it in a specific JSON format. Important: Return ONLY the JSON object, without any additional text, markdown formatting, or code blocks. The JSON should have this structure:
    
    {
      "name": "Recipe Name",
      "url": "Recipe URL",
      "total_time_minutes": number,
      "ingredients": [
        { "name": "Ingredient Name", "quantity": "Quantity" }
      ],
      "equipment": [
        "Equipment Item"
      ],
      "steps": [
        {
          "description": "Step Description",
          "duration_minutes": number,
          "substeps": [
            {
              "description": "Substep Description",
              "duration_minutes": number (optional),
              "ingredients": [
                { "name": "Ingredient Name", "quantity": "Quantity" }
              ]
            }
          ]
        }
      ],
    }
    
    Guidelines:
    - The ingredients should be a list with quantities.
    - The equipment should be a list of equipment needed. Be specific about the measuring cup and spoon sizes needed.
    - Each step should have a description, duration in minutes, and a list of substeps.
    - each sentence within a step should be a substep.
    - if a step or subtep contains a list of ingredients, each ingredient should be a seperate ingredient in the substep.
    - Include durations in minutes for each step and the total time.
    - Take into account any estimated durations and actual specified durations in caculating the time for each step.
    - If a step has no specified duration, estimate a reasonable duration in minutes.
    - make sure the total time is the sum of all the step times.
    - Ignore anything from the input that is not relevant to the recipe.
    
    Recipe Name: ${recipeName}
    Recipe URL: ${recipeUrl}

    Recipe:
    ${rawRecipe}

    Remember: Provide ONLY the JSON object in your response, with no additional text or formatting.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0].message?.content;

    if (!assistantMessage) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    try {
      const cleanedRecipe: Recipe = JSON.parse(assistantMessage);
      return NextResponse.json(cleanedRecipe, { status: 200 });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return NextResponse.json({ error: 'Invalid JSON response from OpenAI' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in refine-recipe API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

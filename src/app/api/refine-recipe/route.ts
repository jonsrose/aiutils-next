// src/app/api/refine-recipe/route.ts

import { NextResponse } from 'next/server';
import { Recipe, RefineRecipeResponse } from '../../../types';
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

    // Parse the request body to extract recipe, model, and readyTime
    const { recipe, model, readyTime } = await req.json();

    // Construct the prompt
    const prompt = `
    A recipe is attached, copied from a web page. Your task is to create a cleaned-up recipe that is easier to follow and return it in a specific JSON format:
    
    {
      "name": "Recipe Name",
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
          "start_time": "HH:MM" (optional),
          "substeps": [
            {
              "description": "Substep Description",
              "duration_minutes": number (optional)
            }
          ]
        }
      ],
      "total_time_minutes": number
    }
    
    Guidelines:
    - The ingredients should be a list with quantities.
    - The equipment should be a list of equipment needed. Be specific about the measuring cup and spoon sizes needed.
    - Each step should have a description, duration in minutes, and a list of substeps.
    - Each substep where an ingredient is added should be separate.
    - Include durations in minutes for each step and the total time.
    - Ignore anything from the input that is not relevant to the recipe.
    ${readyTime ? `- Include approximate start times for each step in order to be ready at ${readyTime}.` : ''}
    
    Recipe:
    ${recipe}
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

    const cleanedRecipeJson = JSON.parse(assistantMessage);
    const textOutput = generateTextOutput(cleanedRecipeJson);

    const refineResponse: RefineRecipeResponse = {
      jsonOutput: cleanedRecipeJson,
      textOutput,
    };

    return NextResponse.json(refineResponse, { status: 200 });
  } catch (error) {
    console.error('Error in refine-recipe API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateTextOutput(recipe: Recipe): string {
  console.log('generateTextOutput', {recipe});
  let output = `Recipe: ${recipe.name}\n\n`;

  output += "Ingredients:\n";
  recipe.ingredients.forEach(ing => {
    output += `- ${ing.name}: ${ing.quantity}\n`;
  });

  output += "\nEquipment:\n";
  recipe.equipment.forEach(eq => {
    output += `- ${eq}\n`;
  });

  output += "\nSteps:\n";
  recipe.steps.forEach((step, index) => {
    output += `${index + 1}. ${step.description} (${step.duration_minutes} minutes)`;
    if (step.start_time) {
      output += ` - Start at ${step.start_time}`;
    }
    output += "\n";
    step.substeps.forEach(substep => {
      output += `   - ${substep.description}`;
      if (substep.duration_minutes) {
        output += ` (${substep.duration_minutes} minutes)`;
      }
      output += "\n";
    });
  });

  output += `\nTotal Time: ${recipe.total_time_minutes} minutes`;

  return output;
}
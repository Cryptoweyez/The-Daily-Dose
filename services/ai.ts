import { GoogleGenAI, Type } from "@google/genai";
import { PetInput, NutritionResult } from "../types";

const createAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const calculateNutrition = async (pet: PetInput): Promise<NutritionResult> => {
  const ai = createAIClient();
  if (!ai) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const prompt = `
    Act as a veterinary nutritionist. Analyze the following pet details and provide daily nutritional recommendations.
    
    Pet Details:
    - Name: ${pet.name || "Unnamed"}
    - Species: ${pet.species}
    - Breed: ${pet.breed}
    - Age: ${pet.age} years old
    - Sex: ${pet.sex}
    - Weight: ${pet.weight} lbs
    - Activity Level: ${pet.activityLevel}
    - Medical Conditions: ${pet.medicalConditions.join(', ') || "None"}
    - Food Preference: ${pet.foodType}
    - Preferred Brands: ${pet.foodBrands.join(', ') || "Generic/None"}

    Task:
    1. Calculate the daily caloric needs (Resting Energy Requirement * Factor based on activity level and life stage).
    2. Recommend the amount of wet and/or dry food based on the 'Food Preference' and 'Preferred Brands'. 
       If specific brands are listed, estimate based on their typical caloric density.
       If 'Both' is selected, split calories approx 50/50 or appropriately for the species.
    3. Provide a brief summary of why this is the recommendation.
    4. Provide specific advice considering the medical conditions (e.g., "Avoid high sodium for heart issues").
    5. List top 3 specific Wet Food products and top 3 specific Dry Food products (Brand + specific formula).
       - If the user selected 'Wet' only, prioritize that, but IF 'Dry' would be beneficial (e.g. for dental health), include recommendations for it with a note why.
       - If the user selected 'Dry' only, prioritize that, but IF 'Wet' would be beneficial (e.g. for hydration in cats), include recommendations for it with a note why.
       - If 'Both', provide 3 of each.

    Return the data in a strict JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalories: { type: Type.NUMBER, description: "Total recommended calories per day in kcal" },
            wetFoodAmount: { type: Type.STRING, description: "Description of wet food amount (e.g., '1.5 cans (5.5oz)') or '0' if none" },
            dryFoodAmount: { type: Type.STRING, description: "Description of dry food amount (e.g., '1 cup') or '0' if none" },
            summary: { type: Type.STRING, description: "A concise summary of the diet plan." },
            advice: { type: Type.STRING, description: "Specific medical or dietary advice based on inputs." },
            recommendations: {
              type: Type.OBJECT,
              properties: {
                wet: {
                  type: Type.ARRAY,
                  description: "Top 3 Wet Food recommendations",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Full name of the product (Brand + Formula)" },
                      reason: { type: Type.STRING, description: "Short reason why this is good" }
                    },
                    required: ["name", "reason"]
                  }
                },
                dry: {
                  type: Type.ARRAY,
                  description: "Top 3 Dry Food recommendations",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Full name of the product (Brand + Formula)" },
                      reason: { type: Type.STRING, description: "Short reason why this is good" }
                    },
                    required: ["name", "reason"]
                  }
                }
              },
              required: ["wet", "dry"]
            }
          },
          required: ["dailyCalories", "wetFoodAmount", "dryFoodAmount", "summary", "advice", "recommendations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as NutritionResult;
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("AI Calculation Error:", error);
    throw new Error("Failed to calculate nutrition plan. Please try again.");
  }
};
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { GameData } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const sentenceSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      sentence: {
        type: Type.STRING,
        description: "A sentence describing the image using 'There is' or 'There are'.",
      },
      isCorrect: {
        type: Type.BOOLEAN,
        description: "A boolean indicating if the sentence is a factually correct description of the image.",
      },
    },
    required: ["sentence", "isCorrect"],
  },
};

export const generateGameContent = async (): Promise<GameData> => {
  try {
    const imagePrompts = [
      "A clear, well-lit photograph of a kitchen table set for breakfast for two. The scene should only contain objects and food items that are common A2-level English vocabulary (e.g., table, chair, plate, fork, knife, spoon, glass, cup, apple, banana, bread, milk, juice). The style should be realistic and easy for an English learner to understand. No people.",
      "A clear, sunny photograph of a dog park. The scene should only contain objects and animals that are common A2-level English vocabulary (e.g., dog, tree, ball, bench, grass, flower, water). There should be a few dogs of different colors. The style should be realistic and easy for an English learner to understand. No people.",
      "A clear, sunny photograph of a beach. The scene should only contain objects that are common A2-level English vocabulary (e.g., sand, sea, boat, shell, umbrella, chair, towel, sun, cloud). The style should be realistic and easy for an English learner to understand. No people.",
      "A clear photograph of a cozy living room. The scene should only contain objects that are common A2-level English vocabulary (e.g., sofa, table, lamp, book, window, picture, clock, rug, plant). The style should be realistic and easy for an English learner to understand. No people.",
      "A clear photograph of a simple city street. The scene should only contain objects that are common A2-level English vocabulary (e.g., car, bus, house, tree, street, sign, bicycle, building, shop). The style should be realistic and easy for an English learner to understand. No people."
    ];
    
    const randomPrompt = imagePrompts[Math.floor(Math.random() * imagePrompts.length)];

    // Step 1: Generate an image
    const imageGenerationResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: randomPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const imagePart = imageGenerationResult.candidates?.[0]?.content?.parts?.[0];
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("Image generation failed or returned an invalid format.");
    }
    
    const base64ImageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;

    // Step 2: Analyze the image and generate sentences
    const sentenceGenerationPrompt = `
      Analyze this image. Identify objects and their quantities. Based on your analysis, generate an array of exactly 5 sentences for an ESL grammar game.
      - Each sentence must start with "There is" or "There are".
      - 3 of the sentences must be factually correct descriptions of the image.
      - 2 of the sentences must be factually incorrect (e.g., wrong object, wrong count).
      - Ensure a good mix of singular ("There is a...") and plural ("There are...") sentences.
      - The sentences should be simple and clear for English learners.
      - Use only A2-level English vocabulary.
    `;
    
    const sentenceGenerationResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              { inlineData: { data: base64ImageData, mimeType: mimeType } },
              { text: sentenceGenerationPrompt },
          ],
      },
      config: {
          responseMimeType: 'application/json',
          responseSchema: sentenceSchema,
      },
    });

    const sentences = JSON.parse(sentenceGenerationResult.text);
    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
        throw new Error("Sentence generation failed to produce a valid array.");
    }

    return {
      image: `data:${mimeType};base64,${base64ImageData}`,
      sentences,
    };
  } catch (error) {
    console.error("Error generating game content:", error);
    throw new Error("Failed to communicate with the AI service. Please check your connection and API key.");
  }
};
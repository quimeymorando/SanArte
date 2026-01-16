
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env manually for this script
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.VITE_GEMINI_API_KEY;

console.log("Testing Gemini API with Key:", apiKey ? "FOUND (Ends with " + apiKey.slice(-4) + ")" : "MISSING");

async function testGemini() {
    if (!apiKey) {
        console.error("No API KEY found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    console.log("Attempting to generate content for 'Vulva'...");

    try {
        const prompt = `Define 'Vulva' in the context of biodecoding. Return a short JSON object: { "emotionalMeaning": "test" }`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("SUCCESS! API Response:");
        console.log(text);
    } catch (error: any) {
        console.error("GENERATION FAILED:");
        console.error(error.message || error);

        if (error.message && error.message.includes("404")) {
            console.log("\n--> Diagnosis: Model 'gemini-flash-lite-latest' not found. Try 'gemini-1.5-flash'.");
        }
    }
}

testGemini();

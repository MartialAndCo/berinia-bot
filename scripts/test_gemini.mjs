
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Checking Key:", apiKey ? "Present" : "MISSING");

async function run() {
    if (!apiKey) {
        console.error("No API Key found.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "models/gemini-2.5-flash", "models/gemini-2.0-flash"];

    console.log("Starting Model Compatibility Test...");

    for (const modelName of models) {
        process.stdout.write(`Testing model: ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ SUCCESS`);
            console.log("Response:", result.response.text());
            return; // Exit on first success
        } catch (e) {
            console.log(`❌ FAILED (${e.status || 'Error'})`);
        }
    }
    console.log("All models failed.");
}

run();

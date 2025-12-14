
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeSiteContent(siteText: string, url: string) {
    console.log(`[DEBUG] Analyzer Started. URL: ${url}`);
    console.log(`[DEBUG] Text Length: ${siteText?.length}`);

    try {
        if (!apiKey) {
            console.warn("GEMINI_API_KEY missing, using fallback.");
            throw new Error("Missing API Key");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are the AI "Digital Twin" of the company found at ${url}.
      Your goal is to create your own internal "Knowledge Base" based on the scraped content below.

      Scraped Content (Snippet):
      ${siteText.slice(0, 15000)} ...

      INSTRUCTIONS:
      1. Write the "knowledgeBaseSummary" in the **FIRST PERSON** ("We", "Us", "Our").
         - Example: "We are [Company Name], specializing in [Service]..."
         - Example: "Our services include..."
         
      2. **CRITICAL:** If information is missing (e.g., Pricing, Specific Hours), **OMIT IT COMPLETELY**. 
         - DO NOT write "Not available", "Unknown", or "N/A".
         - If it's not in the text, do not mention it at all.

      3. Structure the summary clearly but naturally:
         - Who we are (Mission/Identity)
         - What we do (Services/Products)
         - Operational Details (Hours, Locations - ONLY if found)
         - Contact (how to reach us)

      OUTPUT JSON (No markdown):
      {
        "companyName": "Exact Company Name",
        "industry": "Specific Niche",
        "knowledgeBaseSummary": "We are [Name]... \\nWe help clients with... \\nOur office is located at...",
        "openingGreeting": "Welcome to [Company Name]! How can we help you today?" 
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);

    } catch (error: any) {
        console.warn(`[Analyzer Warning] Gemini API failed: ${error.message}. Using Regex Fallback.`);

        const titleMatch = siteText.match(/Title:\s*([^\n]+)/i);
        const descMatch = siteText.match(/Description:\s*([^\n]+)/i);
        let extractedName = titleMatch && titleMatch[1] ? titleMatch[1].trim() : "The Company";
        let extractedDesc = descMatch && descMatch[1] ? descMatch[1].trim() : "a leading provider.";
        extractedName = extractedName.split(/[-|:]/)[0].trim();

        return {
            companyName: extractedName,
            industry: "General",
            knowledgeBaseSummary: `Business Name: ${extractedName}\nAbout: ${extractedDesc}\nSource: ${url}`,
            openingGreeting: `Welcome to ${extractedName}! How can we help you today?`
        };
    }
}

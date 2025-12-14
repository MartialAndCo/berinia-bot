
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
      You are an expert Business Analyst. Extract a structured "Knowledge Base Summary" for the company below from the scraped content.

      Input URL: ${url}
      Scraped Content (Snippet):
      ${siteText.slice(0, 15000)} ...

      INSTRUCTIONS:
      1. Analyze the text to find:
         - Business Name & Mission
         - Services / Products (Key offerings)
         - Opening Hours / Availability
         - Contact Info (Phone, Email, Address, methods)
         - Pricing (if found)
         - FAQ / Common Questions
         
      2. GENERATE A SUMMARY (KnowledgeBaseSummary).
         - This summary will be fed into a "Digital Twin" AI agent.
         - It must be dense, factual, and organized.
         - NO "System Prompt" instructions (like "You are..."). ONLY invalid data.
         
      OUTPUT JSON (No markdown):
      {
        "companyName": "Exact Company Name",
        "industry": "Specific Niche",
        "knowledgeBaseSummary": "Business Name: ... \\nMission: ... \\nServices: ... \\nHours: ... \\nContact: ...",
        "openingGreeting": "Contextual opening." 
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


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

        // Using "gemini-2.5-flash" as explicitly requested by user
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert AI Agent Architect. Create a "Digital Twin" for the company below.

      Input URL: ${url}
      Scraped Content:
      ${siteText}

      INSTRUCTIONS:
      1. Analyze the HTML structure Deeply. Look for:
         - "About Us" / "Mission"
         - "Services" / "Products" (and their descriptions)
         - "Process" (How it works steps)
         - "Opening Hours" / "Availability"
         - "Contact Info" (Phone, Email, Address)
         - "Pricing" (if available)
         - "FAQ" (Common questions)
         
      2. GENERATE A SPECIFIC PERSONA ("Digital Twin").
         - Use "we" and "us".
         - Be knowledgeable about the specific process and hours found.
         
      3. Create a System Prompt that includes:
         - Role: "You are [Name], the specialist for [Company]."
         - Knowledge Base: 
            * Business Hours: [Insert Hours]
            * Process: [Insert Steps]
            * Key Services: [List]
            * Contact: [Details]
         - Mission: Specific goals (e.g. Schedule a meeting during open hours).
         - Guidelines: "Be professional", "Use the specific information provided".

      OUTPUT JSON (No markdown):
      {
        "companyName": "Exact Company Name",
        "industry": "Specific Niche",
        "systemPrompt": "Detailed system instructions (150 words).",
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

        // GRACEFUL REGEX FALLBACK
        const titleMatch = siteText.match(/Title:\s*([^\n]+)/i);
        const descMatch = siteText.match(/Description:\s*([^\n]+)/i);

        // Extract raw values or defaults
        let extractedName = titleMatch && titleMatch[1] ? titleMatch[1].trim() : "The Company";
        let extractedDesc = descMatch && descMatch[1] ? descMatch[1].trim() : "a leading provider.";

        // Refine Name (remove slogans like " - Official Site")
        extractedName = extractedName.split(/[-|:]/)[0].trim();

        return {
            companyName: extractedName,
            industry: "General",
            systemPrompt: `You are the AI Assistant for ${extractedName}. 
            
            About Us:
            ${extractedDesc}
            
            Your Mission:
            Assist visitors on our website (${url}). Answer questions based on the content context provided.
            Always use 'we' and 'us' to represent the brand. Be professional, concise, and helpful.`,
            openingGreeting: `Welcome to ${extractedName}! How can we help you today?`
        };
    }
}

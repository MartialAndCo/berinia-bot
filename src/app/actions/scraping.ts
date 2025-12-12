'use server'

import { ApifyClient } from 'apify-client';
import { getActiveScrapingMissions, getAllScrapingMissions } from '@/lib/airtable';

// Initialize Apify Client
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export async function triggerApifyScraping(data: {
    keyword: string;
    location: string;
    maxLeads: number;
}) {
    if (!process.env.APIFY_API_TOKEN) {
        throw new Error("APIFY_API_TOKEN is not configured");
    }

    try {
        // Prepare the payload for the Google Maps Scraper
        // Actor ID: nwua9Gu5YrADL7ZNj (Google Maps Scraper)
        // Adjust actor ID and input according to specific needs or user specs
        // The user mentioned "Google Maps via Apify". The most popular one is compass/crawler-google-places or similar.
        // But often users use "google-maps-scraper" (drobnikj/google-maps-scraper or similar).
        // Let's assume a generic input structure based on the user's prompt.

        /* 
         User Payload Example:
         {
           "searchStringsArray": [`${keyword} in ${location}`],
           "maxCrawledPlacesPerSearch": maxLeads,
           "language": "en",
           "webhookUrl": process.env.N8N_INGESTION_WEBHOOK
         }
        */

        const input = {
            searchStringsArray: [`${data.keyword} in ${data.location}`],
            maxCrawledPlacesPerSearch: data.maxLeads,
            language: "en",
        };

        // Add webhook only if configured
        const options = process.env.N8N_INGESTION_WEBHOOK ? {
            webhooks: [{
                eventTypes: ['ACTOR.RUN.SUCCEEDED'],
                requestUrl: process.env.N8N_INGESTION_WEBHOOK,
            }]
        } : undefined;

        // Run the actor
        // We use "compass/crawler-google-places" as a safe default for "Google Maps Scraper" 
        // OR the user might have a specific one. The prompt implies a generic one.
        // Let's use the one that matches the input format best. 
        // "compass/crawler-google-places" uses `searchStringsArray`.

        // Note: We are triggering it asynchronously usually, but client.actor().call() waits.
        // For server actions, we might want to just start it (call) or start and wait.
        // The user says "Lancement Manuel". Waiting might timeout.
        // Apify Client `call` waits for finish. `start` just starts.
        // Let's use `start` to avoid Vercel/Amplify timeouts.

        const run = await client.actor("compass/crawler-google-places").start(input, options as any);

        return { success: true, runId: run.id };

    } catch (error: any) {
        console.error("Apify Trigger Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getScrapingConfig() {
    // Wrapper to be called from Client Components
    return await getAllScrapingMissions();
}

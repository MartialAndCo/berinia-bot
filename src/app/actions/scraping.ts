'use server'

import { ApifyClient } from 'apify-client';
import { getActiveScrapingMissions, getAllScrapingMissions } from '@/lib/airtable';

// Helper to get client at runtime (avoids build-time/module-scope env issues)
function getClient() {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
        throw new Error("Configuration Error: APIFY_API_TOKEN is missing on server.");
    }
    return new ApifyClient({ token });
}

export async function triggerApifyScraping(data: {
    keyword: string;
    location: string;
    maxLeads: number;
}) {
    if (!process.env.APIFY_API_TOKEN) {
        console.error("Scraping Trigger Failed: APIFY_API_TOKEN missing");
        return { success: false, error: "Configuration Error: APIFY_API_TOKEN is missing on server." };
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

        const searchString = `${data.keyword} in ${data.location}`;
        const input = {
            searchStringsArray: [searchString],
            maxCrawledPlacesPerSearch: data.maxLeads,
            language: "en",
        };

        if (!process.env.N8N_INGESTION_WEBHOOK) {
            console.error("Scraping Trigger Failed: N8N_INGESTION_WEBHOOK missing");
            return { success: false, error: "Configuration Error: N8N_INGESTION_WEBHOOK is missing on server. Check Vercel/Amplify vars." };
        }

        // Construct webhook URL with query parameters to pass metadata to n8n
        let webhookUrl = process.env.N8N_INGESTION_WEBHOOK;
        try {
            const urlObj = new URL(webhookUrl);
            urlObj.searchParams.append('query', searchString);
            urlObj.searchParams.append('max', data.maxLeads.toString());
            webhookUrl = urlObj.toString();
        } catch (e) {
            console.warn("Could not parse N8N webhook URL to append params:", e);
        }

        const options = {
            webhooks: [{
                eventTypes: ['ACTOR.RUN.SUCCEEDED'],
                requestUrl: webhookUrl,
            }]
        };

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

        const run = await getClient().actor("compass/crawler-google-places").start(input, options as any);

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

import { createScrapingMission, updateScrapingMissionStatus, deleteScrapingMission } from '@/lib/airtable';
import { revalidatePath } from 'next/cache';

export async function createMission(data: { keyword: string; location: string; maxLeads: number }) {
    try {
        await createScrapingMission(data);
        revalidatePath('/scrap');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleMission(id: string, currentStatus: string) {
    try {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        await updateScrapingMissionStatus(id, newStatus);
        revalidatePath('/scrap');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteMission(id: string) {
    try {
        await deleteScrapingMission(id);
        revalidatePath('/scrap');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getApifyRuns() {
    try {
        if (!process.env.APIFY_API_TOKEN) {
            console.warn("Skipping getApifyRuns: APIFY_API_TOKEN not set.");
            return [];
        }

        // Fetch last 10 runs to avoid timeout/slowness
        const runsList = await getClient().runs().list({
            desc: true,
            limit: 10
        });

        // Enrich runs
        const enrichedRuns = await Promise.all(runsList.items.map(async (run: any) => {
            let keyword = 'Unknown';
            let location = '-';
            let itemCount = 0;

            try {
                // 1. Fetch Input
                // Use a tighter timeout or catch specific errors
                if (run.defaultKeyValueStoreId) {
                    const client = getClient();
                    const inputRecord = await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('INPUT');
                    const inputToCheck = inputRecord?.value as any;

                    if (inputToCheck?.searchStringsArray?.length > 0) {
                        const searchString = inputToCheck.searchStringsArray[0];
                        if (typeof searchString === 'string') {
                            if (searchString.includes(' in ')) {
                                const parts = searchString.split(' in ');
                                keyword = parts[0].trim();
                                location = parts.slice(1).join(' in ').trim();
                            } else {
                                keyword = searchString.trim();
                            }
                        }
                    } else if (inputToCheck?.queries) {
                        // Handle generic Google Maps scraper input format if different
                        keyword = inputToCheck.queries;
                    }
                }

                // 2. Fetch Dataset Info
                if (run.defaultDatasetId) {
                    const dataset = await getClient().dataset(run.defaultDatasetId).get();
                    itemCount = dataset?.itemCount || 0;
                }

            } catch (err) {
                // Squelch individual enrichment errors to keep logs clean
            }

            // Extract maxLeads from input or default to 20
            let maxLeads = 20;
            try {
                if (run.defaultKeyValueStoreId) {
                    const inputRecord = await getClient().keyValueStore(run.defaultKeyValueStoreId).getRecord('INPUT');
                    const val = inputRecord?.value as any;
                    if (val?.maxCrawledPlacesPerSearch) {
                        maxLeads = val.maxCrawledPlacesPerSearch;
                    }
                }
            } catch (e) {
                // Ignore input fetch error
            }

            return {
                id: run.id,
                status: run.status,
                startedAt: run.startedAt,
                finishedAt: run.finishedAt,
                duration: run.finishedAt && run.startedAt
                    ? Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
                    : 0,
                defaultDatasetId: run.defaultDatasetId,
                keyword,
                location,
                itemCount,
                maxLeads
            };
        }));

        // Log count only if very necessary, otherwise silence
        return enrichedRuns;

    } catch (error) {
        console.error("Failed to fetch Apify runs:", error);
        return [];
    }
}

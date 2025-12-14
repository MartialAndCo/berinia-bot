
const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

async function debugMaxLeads() {
    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });

    try {
        console.log('Fetching last 5 runs...');
        // @ts-ignore
        const runs = await client.runs().list({ limit: 5, desc: true });

        for (const run of runs.items) {
            let maxLeads = 20; // Default
            let extracted = false;

            try {
                if (run.defaultKeyValueStoreId) {
                    const inputRecord = await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('INPUT');
                    const val = inputRecord?.value;
                    if (val?.maxCrawledPlacesPerSearch) {
                        maxLeads = val.maxCrawledPlacesPerSearch;
                        extracted = true;
                    }
                }
            } catch (e) {
                console.error(`Error on run ${run.id}: ${e.message}`);
            }

            console.log(`Run ${run.id}: Extracted? ${extracted} | Value: ${maxLeads}`);
        }

    } catch (e) {
        console.error('Main error:', e);
    }
}

debugMaxLeads();

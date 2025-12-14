
const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

async function debugExtraction() {
    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });

    try {
        console.log('Listing runs...');
        // @ts-ignore
        const runs = await client.runs().list({ limit: 1, desc: true });
        const run = runs.items[0];
        console.log(`Run ID: ${run.id}`);
        console.log(`KVS ID: ${run.defaultKeyValueStoreId}`);
        console.log(`Dataset ID: ${run.defaultDatasetId}`);

        // Test Input Extraction
        try {
            console.log('Fetching INPUT record...');
            const inputRecord = await client.keyValueStore(run.defaultKeyValueStoreId).getRecord('INPUT');
            console.log('Input Record Found:', !!inputRecord);
            if (inputRecord) {
                const val = inputRecord.value;
                console.log('Input Value Keys:', Object.keys(val));
                console.log('searchStringsArray:', val.searchStringsArray);
            }
        } catch (e) {
            console.error('Input extraction failed:', e.message);
        }

        // Test Dataset Stats Extraction
        try {
            console.log('Fetching Dataset info...');
            // @ts-ignore
            const dataset = await client.dataset(run.defaultDatasetId).get();
            console.log('Dataset Info:', dataset);
            console.log('Item Count:', dataset.itemCount);
        } catch (e) {
            console.error('Dataset extraction failed:', e.message);
        }

    } catch (e) {
        console.error('Main error:', e);
    }
}

debugExtraction();


const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

async function inspectRunDetails() {
    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });

    try {
        console.log('Fetching last run...');
        // @ts-ignore
        const runs = await client.runs().list({ limit: 1, desc: true });

        if (runs.items.length === 0) {
            console.log('No runs found.');
            return;
        }

        const lastRun = runs.items[0];
        console.log('--- Run Summary (List Endpoint) ---');
        console.log(JSON.stringify(lastRun, null, 2));

        console.log('\nFetching Run Info (Get Endpoint)...');
        const runInfo = await client.run(lastRun.id).get();
        console.log(JSON.stringify(runInfo, null, 2));

        console.log('\nFetching Run Input...');
        const input = await client.keyValueStore(lastRun.defaultKeyValueStoreId).getRecord('INPUT');
        console.log(JSON.stringify(input ? input.value : "No Input Found", null, 2));

        console.log('\nFetching Dataset Info...');
        const dataset = await client.dataset(lastRun.defaultDatasetId).list({ limit: 0 }); // Just to get total items?
        // Actually dataset.get() gives item count.
        const datasetInfo = await client.dataset(lastRun.defaultDatasetId).get();
        console.log(JSON.stringify(datasetInfo, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }
}

inspectRunDetails();


const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

async function testListRuns() {
    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });

    try {
        console.log('Testing client.runs().list()...');
        // @ts-ignore
        const runs1 = await client.runs().list({ limit: 1 });
        console.log('✅ client.runs().list() worked!');
    } catch (e) {
        console.log('❌ client.runs().list() failed:', e.message);
    }

    try {
        console.log('Testing client.runs.list()...');
        // @ts-ignore
        const runs2 = await client.runs.list({ limit: 1 });
        console.log('✅ client.runs.list() worked!');
    } catch (e) {
        console.log('❌ client.runs.list() failed:', e.message);
    }

    try {
        console.log('Testing client.acts.listRuns()...');
        // @ts-ignore
        const runs3 = await client.acts.listRuns({ limit: 1 }); // Old way
        console.log('✅ client.acts.listRuns() worked!');
    } catch (e) {
        console.log('❌ client.acts.listRuns() failed:', e.message);
    }
}

testListRuns();


const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

async function testExecution() {
    console.log('🚀 Testing Apify Actor Execution...');

    if (!process.env.APIFY_API_TOKEN) {
        console.error('❌ Missing APIFY_API_TOKEN');
        return;
    }

    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });

    const input = {
        searchStringsArray: ["Coffee in New York"],
        maxCrawledPlacesPerSearch: 1, // Minimal test
        language: "en",
    };

    console.log('   Payload:', JSON.stringify(input));

    try {
        console.log('   Starting actor "compass/crawler-google-places"... (This may take a moment)');
        // Using .start() as in the real code
        const run = await client.actor("compass/crawler-google-places").start(input);

        console.log('✅ Actor Started Successfully!');
        console.log('   Run ID:', run.id);
        console.log('   Status:', run.status);
        console.log('   Actor Run URL:', `https://console.apify.com/actors/${run.actId}/runs/${run.id}`);

        // Wait briefly to see if it crashes immediately? 
        // No, .start() returns the run object immediately. 
        // If it returns, it "worked" from an API perspective.

    } catch (error) {
        console.error('❌ Execution Failed:', error);
    }
}

testExecution();

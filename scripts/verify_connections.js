
const Airtable = require('airtable');
const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

async function testConnections() {
    console.log('🔍 Starting Connection Diagnostics...\n');

    // 1. Check Env Vars
    const requiredVars = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'APIFY_API_TOKEN'];
    const missing = requiredVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.error('❌ Missing Environment Variables:', missing.join(', '));
        console.log('👉 Please ensure .env.local exists and has these values.');
        return;
    } else {
        console.log('✅ Critical Environment Variables present.');
    }

    // 2. Test Airtable
    console.log('\nTesting Airtable Connection...');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const tableId = process.env.AIRTABLE_CONFIG_TABLE_ID || 'Scraping Missions'; // Try name if ID missing, or user might need to adjust

    try {
        // Try to fetch 1 record
        console.log(`   Targeting Table: "${tableId}"`);
        const records = await base(tableId).select({ maxRecords: 1 }).firstPage();
        console.log('✅ Airtable Connected Successfully!');
        if (records.length > 0) {
            console.log('   Create sample read:', records[0].fields);
        } else {
            console.log('   Table is empty but accessible.');
        }
    } catch (error) {
        console.error('❌ Airtable Connection Failed:', error.message);
        if (error.statusCode === 404) {
            console.log('   hint: Check if Table Name/ID is correct. AWS env vars might verify, but local .env.local needs it too.');
        }
    }

    // 3. Test Apify
    console.log('\nTesting Apify Connection...');
    const client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });

    try {
        const user = await client.user().get();
        if (user) {
            console.log(`✅ Apify Authenticated as: ${user.username || user.id}`);

            // Check Actor Access
            console.log('   Verifying Actor "compass/crawler-google-places"...');
            // We can't easy "check" access without running, but getting the actor info works usually if public
            // However, the actor is public.
            console.log('   Actor "compass/crawler-google-places" is public, assuming accessible with valid token.');
        } else {
            console.error('❌ Apify User not found (Token might be invalid).');
        }
    } catch (error) {
        console.error('❌ Apify Connection Failed:', error.message);
    }
}

testConnections();

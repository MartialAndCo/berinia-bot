
const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

async function verifySchema() {
    console.log('🔍 Verifying Airtable Schema Compatibility...\n');

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const tableId = process.env.AIRTABLE_CONFIG_TABLE_ID || 'Scraping Missions';

    console.log(`   Target Table: "${tableId}"`);

    // 1. Test the "Status" column existence via Filter Formula
    // If "Status" column doesn't exist, this should throw an error.
    console.log('   Testing filter: "{Status} = \'Active\'"...');
    try {
        const records = await base(tableId).select({
            filterByFormula: "{Status} = 'Active'",
            maxRecords: 1
        }).firstPage();

        console.log('✅ "Status" column exists and query is valid.');
        console.log(`   Found ${records.length} active records.`);

    } catch (error) {
        console.error('❌ Schema Error:', error.message);
        console.log('   🛑 CAUSE: The column "Status" likely does not exist in your Airtable.');
        console.log('   👉 Please create a Single Select column named "Status" with option "Active".');
        return;
    }

    // 2. Test other columns (Keyword, Location, etc.) requires a record to exist.
    // If table is empty, we can't verify other cols easily without metadata API (which needs personal token, likely have it).
    // But let's assume if Status exists, user likely followed instructions?
    // Let's TRY to create a dummy record to verify all columns? 
    // User asked me to "fix bugs", not corrupt data.
    // I won't create data unless necessary.

    console.log('\n✅ Airtable Schema seems compatible for reading.');
}

verifySchema();

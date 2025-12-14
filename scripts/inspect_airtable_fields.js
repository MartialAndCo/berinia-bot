
const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

async function inspectFields() {
    console.log('🔍 Inspecting Airtable Fields...');

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const tableId = process.env.AIRTABLE_CONFIG_TABLE_ID;

    try {
        const records = await base(tableId).select({ maxRecords: 1 }).firstPage();
        if (records.length === 0) {
            console.log('⚠️ No records found. Cannot inspect fields from an empty table.');
            console.log('   Please create one record manually in Airtable so I can see the column names.');
        } else {
            console.log('✅ Found a record. Available Fields:');
            console.log(JSON.stringify(records[0].fields, null, 2));
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

inspectFields();

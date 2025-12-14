
const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

async function seedTestMission() {
    console.log('🌱 Seeding Airtable with a Test Mission...');

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const tableId = process.env.AIRTABLE_CONFIG_TABLE_ID;

    try {
        const records = await base(tableId).create([
            {
                fields: {
                    "Keyword": "Cafe",
                    "Location": "Paris",
                    "Status": "Active"
                }
            }
        ]);

        console.log(`✅ Created Test Record ID: ${records[0].id}`);
        console.log('   Mission: "Cafe TestBot" in "Paris, France" (Active)');

    } catch (error) {
        console.error('❌ Failed to seed Airtable:', error);
    }
}

seedTestMission();

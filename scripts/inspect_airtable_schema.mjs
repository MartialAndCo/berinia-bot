
import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();

console.log("Script started.");

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_TABLE_NAME || 'Previews';

console.log(`Config: Base=${baseId ? 'OK' : 'MISSING'}, Table=${tableName}`);

if (!apiKey || !baseId) {
    console.error("Missing credentials in .env");
    process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function inspect() {
    try {
        console.log("Fetching records...");
        const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
        console.log(`Fetched ${records.length} records.`);

        if (records.length > 0) {
            const r = records[0];
            console.log("--- FIELD DUMP ---");
            console.log(JSON.stringify(r.fields, null, 2));
        } else {
            console.log("Table is empty.");
        }
    } catch (error) {
        console.error("API Error:", error.message);
    }
}

inspect();

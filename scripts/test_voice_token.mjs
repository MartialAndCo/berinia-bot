
import dotenv from 'dotenv';
dotenv.config();

// We need a valid AgentID to test.
// I'll assume one from previous context or use a placeholder if not available.
// The user provided recordId previously, I need an agentId.
// I'll fetch the latest record from Airtable to get a valid AgentID.

import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_TABLE_NAME || 'Previews';
const base = new Airtable({ apiKey }).base(baseId);

async function testVoiceAPI() {
    try {
        console.log("Fetching a valid AgentID from Airtable...");
        const records = await base(tableName).select({ maxRecords: 1 }).firstPage();

        if (records.length === 0) {
            console.error("No records found in Airtable to test with.");
            return;
        }

        const agentId = records[0].fields.AgentID;
        console.log(`Found AgentID: ${agentId}`);

        if (!agentId) {
            console.error("AgentID is empty in the record.");
            return;
        }

        console.log("Testing POST /api/call/register/ against LOCALHOST...");

        // Note: fetch is native in Node 18+
        const response = await fetch('http://localhost:3000/api/call/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId })
        });

        const status = response.status;
        console.log(`Response Status: ${status}`);

        const data = await response.json();
        console.log("Response Body:", JSON.stringify(data, null, 2));

        if (status === 200 && data.accessToken) {
            console.log("✅ API Test PASSED!");
        } else {
            console.error("❌ API Test FAILED.");
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

testVoiceAPI();

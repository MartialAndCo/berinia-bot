// Native fetch is available in Node 18+
require('dotenv').config({ path: '.env' });
const { Retell } = require('retell-sdk');
const retellClient = new Retell({
    apiKey: process.env.RETELL_API_KEY,
});

async function run() {
    const agentId = "agent_70d2a4eea145eceff75e05294c"; // The hardcoded chat agent
    console.log("Testing POST to http://localhost:3000/api/chat/retell with correct Prospect ID...");

    try {
        const res = await fetch("http://localhost:3000/api/chat/retell", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                agentId, // backend ignores this
                message: "Hello world",
                prospectId: "recG6jbDctVzAEMsw", // The Linked Prospect ID found in debug-airtable.js
                companyName: "Debug Company" // Fallback
            })
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

run();


require('dotenv').config({ path: '.env' });
const { Retell } = require('retell-sdk');
const retellClient = new Retell({
    apiKey: process.env.RETELL_API_KEY,
});

async function run() {
    const agentId = "agent_70d2a4eea145eceff75e05294c";
    console.log("Creating Chat Session for:", agentId);

    try {
        const chatSession = await retellClient.chat.create({
            agent_id: agentId,
            retell_llm_dynamic_variables: {
                business_name: "Test Business",
                company_knowledge_base: "We support testing."
            }
        });

        console.log("Chat Session Created:");
        console.log(JSON.stringify(chatSession, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

run();

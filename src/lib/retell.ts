
import Retell from 'retell-sdk';

const retellClient = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
});

interface AgentConfig {
    companyName: string;
    systemPrompt: string;
    initialMessage: string;
}

export async function createRetellProject(config: AgentConfig) {
    try {
        // 1. Create the LLM (Response Engine)
        console.log("Creating Retell LLM...");
        const llmResponse = await retellClient.llm.create({
            model: 'gpt-4.1-mini',
            // 'begin_message' controls the first thing the agent says (or waits for user).
            begin_message: config.initialMessage,
            general_prompt: `You are an AI assistant for ${config.companyName}.
      
      Your Role & Knowledge:
      ${config.systemPrompt}
      
      Keep responses concise and helpful. Be professional but friendly.`,
        });

        const llmId = llmResponse.llm_id;
        console.log("LLM Created:", llmId);

        // 2. Create the Chat Agent
        console.log("Creating Retell Chat Agent...");
        const agentResponse = await retellClient.chatAgent.create({
            agent_name: `${config.companyName} Assistant`,
            response_engine: {
                type: 'retell-llm',
                llm_id: llmId,
            },
        });

        return {
            agentId: agentResponse.agent_id,
            llmId: llmId
        };

    } catch (error) {
        console.error("Retell API Error:", error);
        throw error;
    }
}

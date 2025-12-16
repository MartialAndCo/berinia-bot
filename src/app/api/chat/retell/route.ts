import { NextResponse } from 'next/server';
import { retellClient } from '@/lib/retell';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agentId: voiceAgentId, message, prospectId } = body; // The ID from frontend is the Voice Agent ID
        let { chatId } = body;

        // console.log(`[Retell Chat] Request: voiceAgent=${voiceAgentId}, chat=${chatId || 'NEW'}, msg="${message}"`);

        if (!voiceAgentId && !chatId) {
            return NextResponse.json({ error: 'Missing agentId or chatId' }, { status: 400 });
        }

        // 1. Create a new chat session if no chatId is provided
        let dynamicVariables: Record<string, any> = {};

        // 1. Create a new chat session if no chatId is provided
        if (!chatId) {
            const CHAT_AGENT_ID = 'agent_70d2a4eea145eceff75e05294c';
            console.log('[Retell Chat] Initializing new session for specific Text Agent:', CHAT_AGENT_ID);
            if (prospectId) {
                try {
                    console.log('[Retell Chat] Calling inbound webhook for prospect:', prospectId);
                    const webhookRes = await fetch('https://n8n.berinia.com/webhook/text-inbound', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prospectId })
                    });

                    if (webhookRes.ok) {
                        const rawData = await webhookRes.json();

                        // User instruction: The variable injection logic must match the Voice Agent
                        let webhookVariables = rawData;

                        // Logic to unwrap if the webhook returns { dynamic_variables: { ... } }
                        if (webhookVariables.dynamic_variables && typeof webhookVariables.dynamic_variables === 'object') {
                            console.log('[Retell Chat] Unwrapping nested dynamic_variables from webhook response');
                            webhookVariables = { ...webhookVariables, ...webhookVariables.dynamic_variables };
                            delete webhookVariables.dynamic_variables;
                        }

                        console.log('[Retell Chat] Webhook data received (Keys):', Object.keys(webhookVariables));

                        dynamicVariables = webhookVariables;

                    } else {
                        console.warn('[Retell Chat] Webhook failed with status:', webhookRes.status);
                    }
                } catch (webhookErr) {
                    console.error('[Retell Chat] Webhook error:', webhookErr);
                }
            } else {
                console.warn('[Retell Chat] No prospectId provided, skipping webhook.');
            }

            // Mapping logic for known Airtable fields to Retell Prompt Variables
            if (dynamicVariables['CompanyName']) {
                dynamicVariables['business_name'] = dynamicVariables['CompanyName'];
            }
            if (!dynamicVariables['business_name'] && body.companyName) {

                dynamicVariables['business_name'] = body.companyName;
            }

            if (dynamicVariables['KnowledgeBaseSummary'] && !dynamicVariables['company_knowledge_base']) {
                dynamicVariables['company_knowledge_base'] = dynamicVariables['KnowledgeBaseSummary'];
            }



            // Sanitize variables: Retell only accepts strings
            const sanitizedVariables: Record<string, string> = {};
            for (const [key, value] of Object.entries(dynamicVariables)) {
                if (typeof value === 'object' && value !== null) {
                    sanitizedVariables[key] = JSON.stringify(value);
                } else {
                    sanitizedVariables[key] = String(value);
                }
            }


            const chatSession = await retellClient.chat.create({
                agent_id: CHAT_AGENT_ID,
                retell_llm_dynamic_variables: sanitizedVariables
            });
            chatId = chatSession.chat_id;
            console.log('[Retell Chat] New Session ID:', chatId);
        }

        // 2. Send message to Retell Agent
        // If message is empty/missing, we treat it as a "Start Conversation" trigger
        let userContent = message;
        if (!userContent) {
            userContent = "Generate your initial greeting message for the user in English.";
        }

        if (userContent) {
            const completion = await retellClient.chat.createChatCompletion({
                chat_id: chatId,
                content: userContent,
            });

            // 3. Extract the agent's response
            const newMessages = completion.messages;

            // Filter for agent messages
            const agentResponse = newMessages
                .filter(m => m.role === 'agent' && 'content' in m)
                .map(m => (m as any).content)
                .join('\n\n');

            return NextResponse.json({
                response: agentResponse || "...",
                chatId
            });
        }

        // Should not happen if frontend sends empty message only on init
        return NextResponse.json({ chatId });


    } catch (error) {
        console.error('[Retell Chat] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat message', details: String(error) },
            { status: 500 }
        );
    }
}

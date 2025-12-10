
import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

// Initialize SDK
const retellClient = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(request: Request) {
    try {
        const { message, agentId, chatId } = await request.json(); // Accept chatId if existing

        let currentChatId = chatId;

        // 1. If no chatId, start a new chat session
        if (!currentChatId) {
            console.log(`Creating new chat session for Agent ${agentId}...`);
            const chatSession = await retellClient.chat.create({
                agent_id: agentId,
            });
            currentChatId = chatSession.chat_id;
        }

        // 2. Send the message to Retell
        console.log(`Sending message to Chat ${currentChatId}: ${message}`);
        const completion = await retellClient.chat.createChatCompletion({
            chat_id: currentChatId,
            content: message,
        });

        // 3. Extract the agent's response
        const newMessages = completion.messages;
        const agentResponseMsg = newMessages
            .filter(m => m.role === 'agent')
            .pop();

        // Safe access (cast to 'any' if types are strict, or just check 'content' in 'm')
        // Retell types say 'content' is in Message interface.
        const responseText = (agentResponseMsg as any)?.content || "I didn't catch that.";

        return NextResponse.json({
            response: responseText,
            chatId: currentChatId // Return chatId so frontend can reuse it
        });

    } catch (error: any) {
        console.error('Chat Error:', error?.response?.data || error); // Log detailed API error
        return NextResponse.json({
            error: 'Failed to communicate with Retell AI',
            details: error?.message
        }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { retellClient } from '@/lib/retell';

// Removed local init to use shared instance


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agentId } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
        }

        // Create the Web Call
        const callResponse = await retellClient.call.createWebCall({
            agent_id: agentId,
        });

        return NextResponse.json({
            accessToken: callResponse.access_token,
            callId: callResponse.call_id
        });

    } catch (error: any) {
        console.error('Retell Web Call Error Debug:', {
            message: error.message,
            stack: error.stack,
            apiKeyPresent: !!process.env.RETELL_API_KEY,
            // body is not accessible here if it failed to parse, but we can't easily get it without moving the var up. 
            // safer to just ignore it or log it if we moved it. 
            // For now, removing body dependency to fix lint.
        });
        return NextResponse.json({
            error: 'Failed to register call',
            details: error.message
        }, { status: 500 });
    }
}

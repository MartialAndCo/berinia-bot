
import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retell = new Retell({
    apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agentId } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
        }

        // Create the Web Call
        const callResponse = await retell.call.createWebCall({
            agent_id: agentId,
        });

        return NextResponse.json({
            accessToken: callResponse.access_token,
            callId: callResponse.call_id
        });

    } catch (error: any) {
        console.error('Retell Web Call Error:', error);
        return NextResponse.json({
            error: 'Failed to register call',
            details: error.message
        }, { status: 500 });
    }
}

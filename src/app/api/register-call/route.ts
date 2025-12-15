
import { NextResponse } from 'next/server';
import { retellClient } from '@/lib/retell';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agentId, dynamicVariables } = body;

        console.log('[Register Call] Request for agent:', agentId, 'Variables:', dynamicVariables);

        if (!agentId) {
            return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
        }

        // Initialize dynamic variables with what was sent from frontend
        let finalDynamicVariables = { ...dynamicVariables };

        // 2. Call n8n Webhook for Context if prospectId is present
        // (Similar logic to Text Agent API to fetch Airtable data)
        const prospectId = dynamicVariables.prospectId; // Assuming passed in dynamicVariables or body

        if (prospectId) {
            try {
                console.log('[Register Call] Calling inbound webhook for prospect:', prospectId);
                const webhookRes = await fetch('http://56.228.15.237:5678/webhook/inbound-call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'call_inbound',
                        data: {
                            prospectId,
                            agentId
                        }
                    })
                });

                if (webhookRes.ok) {
                    const rawData = await webhookRes.json();

                    // User instruction: The entire 200 OK response body IS the variables object.
                    // BUT: User logs show it might be nested in "dynamic_variables" or simply constructed that way.
                    // We need to flatten it.
                    let webhookVariables = rawData;

                    // Logic to unwrap if the webhook returns { dynamic_variables: { ... } }
                    if (webhookVariables.dynamic_variables && typeof webhookVariables.dynamic_variables === 'object') {
                        console.log('[Register Call] Unwrapping nested dynamic_variables from webhook response');
                        webhookVariables = { ...webhookVariables, ...webhookVariables.dynamic_variables };
                        delete webhookVariables.dynamic_variables;
                    }

                    console.log('[Register Call] Webhook data received (Keys):', Object.keys(webhookVariables));

                    // Merge webhook variables into dynamic variables
                    // Webhook data comes LAST to overwrite defaults (e.g. business_name: Berinia)
                    finalDynamicVariables = { ...finalDynamicVariables, ...webhookVariables };

                } else {
                    console.warn('[Register Call] Webhook failed with status:', webhookRes.status);
                }
            } catch (webhookErr) {
                console.error('[Register Call] Webhook error:', webhookErr);
            }
        }

        // Sanitize variables: Retell only accepts strings
        const sanitizedVariables: Record<string, string> = {};
        for (const [key, value] of Object.entries(finalDynamicVariables)) {
            if (typeof value === 'object' && value !== null) {
                sanitizedVariables[key] = JSON.stringify(value);
            } else {
                sanitizedVariables[key] = String(value);
            }
        }

        // Create the call registration
        // User explicitly requested "dynamic_variables" instead of "retell_llm_dynamic_variables"
        // DEBUG: Log the exact payload we are sending to Retell
        console.log('[Register Call] Final Variables to Inject:', JSON.stringify(sanitizedVariables, null, 2));

        // Create the call registration
        // User explicitly requested "dynamic_variables" instead of "retell_llm_dynamic_variables"

        // Create the call registration
        // We revert to "retell_llm_dynamic_variables" because "dynamic_variables" is ignored by the SDK.

        const payload: any = {
            agent_id: agentId,
            retell_llm_dynamic_variables: sanitizedVariables
        };
        console.log('[Register Call] Final Variables to Inject:', JSON.stringify(sanitizedVariables, null, 2));
        console.log('[Register Call] Calling Retell SDK with payload:', JSON.stringify(payload, null, 2));

        const registerCallResponse = await retellClient.call.createWebCall(payload);

        console.log('[Register Call] Success. Call ID:', registerCallResponse.call_id);

        return NextResponse.json({
            access_token: registerCallResponse.access_token,
            call_id: registerCallResponse.call_id
        });

    } catch (error) {
        console.error('[Register Call] Error:', error);
        return NextResponse.json(
            { error: 'Failed to register call', details: String(error) },
            { status: 500 }
        );
    }
}


import { NextResponse } from 'next/server';
import { scrapeSite } from '@/lib/scraper';
import { analyzeSiteContent } from '@/lib/analyzer';
import { createRetellProject } from '@/lib/retell';
import { saveProject, updateProject } from '@/lib/airtable';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, recordId } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`Processing URL: ${url} (RecordID: ${recordId || 'New'})`);

        // 1. Scrape
        const siteText = await scrapeSite(url);
        console.log(`Scraped ${siteText.length} chars.`);

        // 2. Analyze (Generate KnowledgeBaseSummary)
        const analysis = await analyzeSiteContent(siteText, url);
        console.log(`Analysis complete for ${analysis.companyName}`);

        // 3. Get Fixed Agent IDs
        // "Voice Agent" for the demo (and maybe Text Agent too if needed)
        // User provided specific IDs. We'll use them here.
        const voiceAgentId = process.env.NEXT_PUBLIC_VOICE_AGENT_ID;
        // Text Agent might be used elsewhere or we can save it too if we had a field. 
        // For 'AgentID' field in Airtable, we likely want the Voice Agent ID for the Retell demo.

        if (!voiceAgentId) {
            console.warn("NEXT_PUBLIC_VOICE_AGENT_ID is missing in env!");
        }

        // 4. Save/Update Airtable
        // We save the Fixed Voice Agent ID so the preview page knows which agent to load initially.
        const projectId = await saveProject({
            url,
            agentId: voiceAgentId || "MISSING_AGENT_ID",
            // llmId: "", // Not needed for fixed agent
            companyName: analysis.companyName,
            knowledgeBaseSummary: analysis.knowledgeBaseSummary,
            demoUrl: "", // Placeholder
            recordId: recordId // Pass optional ID
        });

        // 5. Generate Link & Update Airtable
        // 5. Generate Link & Update Airtable
        // Dynamically determine base URL from request headers if possible, to match the current env (localhost vs prod)
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!baseUrl && origin) {
            baseUrl = origin;
        } else if (!baseUrl && host) {
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            baseUrl = `${protocol}://${host}`;
        }

        baseUrl = baseUrl || 'https://demo.berinia.com';

        const previewUrl = `${baseUrl}/preview/${projectId}`;

        await updateProject(projectId, { demoUrl: previewUrl });

        return NextResponse.json({
            status: 'success',
            projectId,
            previewUrl,
            agentId: voiceAgentId,
            companyName: analysis.companyName
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({
            error: 'Failed to generate preview',
            details: error.message
        }, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }
}

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

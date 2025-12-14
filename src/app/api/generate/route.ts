
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
        const voiceAgentId = process.env.NEXT_PUBLIC_VOICE_AGENT_ID;

        if (!voiceAgentId) {
            console.warn("NEXT_PUBLIC_VOICE_AGENT_ID is missing in env!");
        }

        // 4. Save/Update Airtable
        const projectId = await saveProject({
            url,
            agentId: voiceAgentId || "MISSING_AGENT_ID",
            companyName: analysis.companyName,
            knowledgeBaseSummary: analysis.knowledgeBaseSummary,
            demoUrl: "", // Placeholder
            recordId: recordId
        });

        // 5. Generate Link & Update Airtable
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://demo.berinia.com';
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

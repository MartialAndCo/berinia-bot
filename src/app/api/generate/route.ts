
import { NextResponse } from 'next/server';
import { scrapeSite } from '@/lib/scraper';
import { analyzeSiteContent } from '@/lib/analyzer';
import { createRetellProject } from '@/lib/retell';
import { saveProject, updateProject } from '@/lib/airtable';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`Processing URL: ${url}`);

        // 1. Scrape
        const siteText = await scrapeSite(url);
        console.log(`Scraped ${siteText.length} chars.`);

        // 2. Analyze
        const analysis = await analyzeSiteContent(siteText, url);
        console.log(`Analysis complete for ${analysis.companyName}`);

        // 3. Create Retell Agent
        const retellData = await createRetellProject({
            companyName: analysis.companyName,
            systemPrompt: analysis.systemPrompt,
            initialMessage: analysis.openingGreeting
        });
        console.log(`Retell Agent Created: ${retellData.agentId}`);

        // 4. Save to Airtable (Initial)
        const projectId = await saveProject({
            url,
            agentId: retellData.agentId,
            llmId: retellData.llmId,
            companyName: analysis.companyName,
            systemPrompt: analysis.systemPrompt,
            demoUrl: "" // Placeholder
        });

        // 5. Generate Link & Update Airtable
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const previewUrl = `${baseUrl}/preview/${projectId}`;

        await updateProject(projectId, { demoUrl: previewUrl });

        return NextResponse.json({
            status: 'success',
            projectId,
            previewUrl,
            agentId: retellData.agentId,
            companyName: analysis.companyName
        });

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({
            error: 'Failed to generate preview',
            details: error.message
        }, { status: 500 });
    }
}

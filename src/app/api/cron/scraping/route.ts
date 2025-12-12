import { NextResponse } from 'next/server';
import { getActiveScrapingMissions } from '@/lib/airtable';
import { triggerApifyScraping } from '@/app/actions/scraping';

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch Active Missions
    const missions = await getActiveScrapingMissions();

    if (missions.length === 0) {
        return NextResponse.json({ message: 'No active missions found', count: 0 });
    }

    // 3. Trigger Scraps
    const results = [];
    for (const mission of missions) {
        try {
            const result = await triggerApifyScraping({
                keyword: mission.keyword,
                location: mission.location,
                maxLeads: mission.maxLeads
            });
            results.push({ missionId: mission.id, ...result });
        } catch (error: any) {
            results.push({ missionId: mission.id, success: false, error: error.message });
        }
    }

    return NextResponse.json({
        message: 'Scraping missions triggered',
        count: missions.length,
        results
    });
}

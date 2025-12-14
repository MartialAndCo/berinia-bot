import { NextResponse } from 'next/server';
import { getAllProjects, updateProject } from '@/lib/airtable';

export const dynamic = 'force-dynamic'; // Ensure this runs on every request

export async function GET(request: Request) {
    try {
        // Authenticate the request (Simple check or rely on Vercel Cron protection)
        // For now, we'll allow public triggering or add a simple key check if needed.
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

        console.log("Running Expiration Cron Job...");

        const allProjects = await getAllProjects();
        const now = new Date();
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

        const expiredProjects = allProjects.filter(p => {
            if (p.status !== 'Active') return false; // Already inactive
            if (!p.createdTime) return false; // No creation date

            const created = new Date(p.createdTime);
            const age = now.getTime() - created.getTime();

            return age > THIRTY_DAYS_MS;
        });

        console.log(`Found ${expiredProjects.length} expired projects.`);

        // Process updates in parallel
        const results = await Promise.allSettled(
            expiredProjects.map(p => updateProject(p.id, { status: 'Inactive' }))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
            success: true,
            message: `Processed expiration check.`,
            stats: {
                totalChecked: allProjects.length,
                expiredFound: expiredProjects.length,
                deactivated: successful,
                failed: failed
            },
            expiredIds: expiredProjects.map(p => p.id)
        });

    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

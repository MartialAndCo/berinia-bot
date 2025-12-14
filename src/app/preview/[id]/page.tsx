import { getProject } from '@/lib/airtable';
import { PreviewClient } from './PreviewClient';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PageProps) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold font-heading">Project Not Found</h1>
                    <Link href="/" className="text-primary hover:underline font-sans">Go Home</Link>
                </div>
            </div>
        );
    }

    if (project.Status === 'Inactive') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-sans p-4">
                <div className="text-center space-y-6 max-w-md p-8 border border-gray-800 rounded-2xl bg-gray-900/50 backdrop-blur-sm shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h1 className="text-3xl font-bold font-heading text-red-400">Demo Expired</h1>
                    <p className="text-gray-400 text-lg">
                        This AI Agent demo is no longer active.
                    </p>
                    <div className="text-sm text-gray-500 bg-gray-950 p-4 rounded-lg border border-gray-800">
                        Please contact the administrator to re-activate this preview.
                    </div>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-medium transition-all"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    return <PreviewClient project={project} />;
}

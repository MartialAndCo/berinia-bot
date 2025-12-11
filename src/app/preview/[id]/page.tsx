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

    return <PreviewClient project={project} />;
}

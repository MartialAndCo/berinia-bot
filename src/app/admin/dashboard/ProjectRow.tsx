'use client';

import { useState, useTransition } from 'react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toggleDemoStatus } from '@/app/actions/demo';

interface ProjectRowProps {
    project: any;
}

export function ProjectRow({ project }: ProjectRowProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(project.status || 'Active');

    const handleToggle = () => {
        const currentStatus = status;
        // Optimistic update
        setStatus(currentStatus === 'Active' ? 'Inactive' : 'Active');

        startTransition(async () => {
            const result = await toggleDemoStatus(project.id, currentStatus);
            if (!result.success) {
                // Revert on failure
                setStatus(currentStatus);
                alert(`Failed to update status: ${result.error}`);
            } else {
                setStatus(result.newStatus || 'Active');
            }
        });
    };

    const isActive = status === 'Active';

    return (
        <tr className="hover:bg-gray-800/50 transition-colors group">
            <td className="px-6 py-4 max-w-[250px]">
                <div className="font-bold text-white truncate text-base">{project.companyName}</div>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline truncate block">
                    {project.url}
                </a>
                <div className="text-[10px] text-gray-600 mt-1">
                    Created: {new Date(project.createdTime).toLocaleDateString()}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="bg-gray-950/50 p-3 rounded-lg border border-gray-800 text-xs font-mono text-gray-300 max-h-24 overflow-y-auto w-full max-w-md whitespace-pre-wrap">
                    {project.summary ? project.summary.slice(0, 300) + (project.summary.length > 300 ? '...' : '') : 'No summary available'}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20 font-mono">
                        Voice: {project.agentId ? project.agentId.slice(0, 8) + '...' : 'N/A'}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex flex-col items-end gap-3">
                    <Link
                        href={`/preview/${project.id}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${isActive
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                            : 'bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        target="_blank"
                        onClick={(e) => !isActive && e.preventDefault()}
                    >
                        Launch <ExternalLink size={14} />
                    </Link>

                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggle}
                        disabled={isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isActive ? 'bg-green-500' : 'bg-gray-700'
                            }`}
                    >
                        <span className="sr-only">Toggle Status</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-green-500' : 'text-gray-500'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </td>
        </tr>
    );
}

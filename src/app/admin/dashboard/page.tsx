import { redirect } from 'next/navigation';
import { checkSession, logout } from '@/app/actions/auth';
import { getAllProjects } from '@/lib/airtable';
import { ExternalLink, Database, LogOut, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { ProjectRow } from './ProjectRow';

export default async function AdminDashboard() {
    const isSessionValid = await checkSession();

    if (!isSessionValid) {
        redirect('/admin');
    }

    const projects = await getAllProjects();

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                            BA
                        </div>
                        <h1 className="font-bold text-lg text-white">BerinIA Admin Hub</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <form action={logout}>
                            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

                    {/* Scraping Card */}
                    <div className="group relative p-6 bg-gradient-to-br from-gray-900 to-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-900/10">
                        <div className="absolute top-4 right-4 p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Scraping Console</h3>
                        <p className="text-gray-400 text-sm mb-6">Access the lead generation tool, manage missions, and view execution history.</p>

                        <Link
                            href="/scrap"
                            className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all"
                        >
                            Open Console <ExternalLink size={16} />
                        </Link>
                    </div>

                    {/* New Demo Card */}
                    <div className="group relative p-6 bg-gradient-to-br from-gray-900 to-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:shadow-purple-900/10">
                        <div className="absolute top-4 right-4 p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300 transition-colors">
                            <Plus size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">New Demo</h3>
                        <p className="text-gray-400 text-sm mb-6">Generate a new AI Agent demo from a website URL using the fixed agent configuration.</p>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:gap-3 transition-all"
                        >
                            Create Demo <ExternalLink size={16} />
                        </Link>
                    </div>

                    {/* Stats Card (Optional) */}
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col justify-center">
                        <div className="text-gray-400 text-sm font-medium mb-1">Total Demos</div>
                        <div className="text-4xl font-bold text-white">{projects.length}</div>
                        <div className="text-green-400 text-xs mt-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Active Projects
                        </div>
                    </div>

                </div>

                {/* Projects Table */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span>📂</span> Active Demos
                        </h2>
                        {/* Search placeholder - could make this a client component later */}
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                id="search-demos"
                                name="search"
                                type="text"
                                placeholder="Search demos..."
                                className="bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-64 text-white placeholder-gray-600"
                                disabled // server component static for now
                            />
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-950/50 text-gray-500 font-medium uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Knowledge Base Summary</th>
                                        <th className="px-6 py-4">Agent Config</th>
                                        <th className="px-6 py-4 text-right">Preview</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {projects.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-600">
                                                No demos found. Create your first one!
                                            </td>
                                        </tr>
                                    ) : (
                                        projects.map((p) => (
                                            <ProjectRow key={p.id} project={p} />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

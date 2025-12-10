
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({ url }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (data.projectId) {
                router.push(`/preview/${data.projectId}`);
            } else {
                alert('Error generating preview: ' + (data.error || 'Unknown error'));
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 max-w-2xl w-full text-center space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300">
                        <Sparkles size={14} />
                        <span>AI Agent Generator</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Turn your website into <br /> an AI Agent.
                    </h1>
                    <p className="text-lg text-neutral-400 max-w-lg mx-auto">
                        Enter your website URL below. We'll analyze it, generate a custom Retell AI Chatbot, and show you a live preview overlay.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto w-full">
                    <input
                        type="url"
                        placeholder="https://your-company.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        required
                        disabled={loading}
                    />
                    <button
                        type="button" // Debugging: changed to button briefly to verify styles, keeping submit for logic
                        onClick={(e) => handleSubmit(e as any)}
                        disabled={loading}
                        className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Generate <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="pt-8 flex justify-center gap-8 text-neutral-600 text-sm">
                    <span>Powered by OpenAI & Retell</span>
                    <span>•</span>
                    <span>Instant Preview</span>
                </div>
            </div>
        </main>
    );
}

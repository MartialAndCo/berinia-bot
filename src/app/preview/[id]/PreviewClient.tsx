
'use client';

import { useState, useEffect } from 'react';
import { ChatWidget } from '@/components/ChatWidget';
import { Mic, PhoneOff, Loader2 } from 'lucide-react';
import { RetellWebClient } from 'retell-client-js-sdk';

// Initialize outside component to avoid re-creation
const retellClient = new RetellWebClient();

interface ProjectData {
    URL: string;
    AgentID: string;
    CompanyName: string;
}

export function PreviewClient({ project }: { project: ProjectData }) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        // Setup listeners
        retellClient.on('call_started', () => {
            console.log('Call started');
            setIsCallActive(true);
            setIsCalling(false);
        });

        retellClient.on('call_ended', () => {
            console.log('Call ended');
            setIsCallActive(false);
            setIsCalling(false);
        });

        retellClient.on('error', (error) => {
            console.error('Retell error:', error);
            setIsCallActive(false);
            setIsCalling(false);
            alert('Microphone error or connection failed.');
        });

        return () => {
            retellClient.stopCall(); // Cleanup
        };
    }, []);

    const toggleVoice = async () => {
        if (isCallActive) {
            retellClient.stopCall();
            return;
        }

        setIsCalling(true);
        try {
            // 1. Get Access Token
            const response = await fetch('/api/call/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: project.AgentID })
            });
            const data = await response.json();

            if (!data.accessToken) throw new Error("No token returned");

            // 2. Start Call
            await retellClient.startCall({
                accessToken: data.accessToken,
            });

        } catch (error) {
            console.error("Call failed:", error);
            alert("Failed to start voice call. Check console.");
            setIsCalling(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#080C16]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img
                            src="/berinia-logo.png"
                            alt="BerinIA Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </div>

                    {/* Right Side Impact Text */}
                    <div className="text-right hidden sm:block">
                        <p className="text-white font-bold text-lg leading-tight font-heading">Never miss a call or lead again!</p>
                        <p className="text-slate-400 text-sm font-sans">Personalized AI Demo</p>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 px-6 py-12 lg:py-20 max-w-7xl mx-auto">

                {/* Left: Sales Copy */}
                <div className="flex-1 space-y-8 max-w-lg text-center lg:text-left">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wide border border-primary/30">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Live Demo
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-heading">
                            Your New <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                                AI Chat Employee
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed font-sans">
                            Experience how {project.CompanyName}'s custom AI Agent can engage visitors, answer questions 24/7, and book meetings automatically.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <a href="#demo" className="px-8 py-4 bg-primary text-white rounded-full font-semibold shadow-lg hover:bg-primary/90 transition hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 font-heading">
                            Try the Demo
                        </a>
                        <a href="#calendar" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-semibold hover:bg-white/10 transition font-heading">
                            Book a Call
                        </a>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <p className="text-sm text-slate-500 mb-2 font-medium font-heading">Trusted technology powered by</p>
                        <div className="flex gap-4 justify-center lg:justify-start opacity-60 grayscale hover:grayscale-0 transition duration-500 cursor-default text-slate-400 font-sans text-xs">
                            <span className="font-bold">RETELL AI</span>
                            <span className="font-bold">GOOGLE GEMINI</span>
                        </div>
                    </div>
                </div>

                {/* Right: Phone Mockup */}
                <div id="demo" className="flex-1 w-full max-w-[400px] lg:max-w-md relative">
                    {/* Phone Frame */}
                    <div className="relative mx-auto border-neutral-900 bg-neutral-900 border-[14px] rounded-[2.5rem] h-[700px] w-[350px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
                        <div className="h-[32px] w-[3px] bg-neutral-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                        <div className="h-[46px] w-[3px] bg-neutral-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                        <div className="h-[46px] w-[3px] bg-neutral-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                        <div className="h-[64px] w-[3px] bg-neutral-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative flex flex-col">

                            {/* Status Bar */}
                            <div className="h-6 bg-black text-white text-[10px] px-4 flex items-center justify-between z-20 shrink-0">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                                </div>
                            </div>

                            {/* Voice Overlay (If Active) */}
                            {isCallActive && (
                                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                                    <div className="mb-8 w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                                        <Mic className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-heading mb-2">Voice Demo Active</h3>
                                    <p className="text-white/60 mb-8 text-center px-6">Listening...</p>
                                    <button
                                        onClick={toggleVoice}
                                        className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <PhoneOff className="w-4 h-4" /> End Call
                                    </button>
                                </div>
                            )}

                            {/* Chat Interface (Full Height) */}
                            <div className="flex-1 relative">
                                <ChatWidget
                                    agentId={project.AgentID}
                                    companyName={project.CompanyName}
                                    isEmbedded={true}
                                />

                                {/* Voice Trigger Button (Floating over chat at bottom) */}
                                <div className="absolute bottom-20 left-4 right-4 z-40">
                                    {!isCallActive && (
                                        <button
                                            onClick={toggleVoice}
                                            disabled={isCalling}
                                            className="w-full bg-black/80 backdrop-blur-md hover:bg-black text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all border border-white/10 shadow-lg group"
                                        >
                                            {isCalling ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Mic className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <div className="text-sm font-bold">Test Voice Agent</div>
                                                <div className="text-xs text-white/60">Free AI Call Simulation</div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative blobs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
                </div>

            </main>

            {/* Calendar Section */}
            <section id="calendar" className="w-full bg-background py-24 border-t border-white/5 relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl font-bold mb-4 text-white font-heading">Ready to implement this?</h2>
                    <p className="text-slate-400 mb-12 font-sans">Book a time with us to discuss your custom AI integration.</p>

                    {/* Cal.com Embed */}
                    <div className="w-full h-[650px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center">
                        <iframe
                            src="https://cal.com/berinia-ukf1ty/berinia-demo"
                            className="w-full h-full"
                            title="Book a meeting"
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>
    );
}

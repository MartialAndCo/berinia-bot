'use client';

import { useState, useEffect } from 'react';
import { ChatWidget } from '@/components/ChatWidget';
import { Mic, PhoneOff, Loader2, Menu, ShoppingBag, X, MessageCircle } from 'lucide-react';
import { RetellWebClient } from 'retell-client-js-sdk';

// Initialize outside component
const retellClient = new RetellWebClient();

interface ProjectData {
    URL: string;
    AgentID: string;
    CompanyName: string;
}

export function PreviewClient({ project }: { project: ProjectData }) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

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
            // alert('Microphone error or connection failed.');
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
            const response = await fetch('/api/call/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: project.AgentID })
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Voice API Error:", data);
                throw new Error(data.details || data.error || "Unknown error");
            }

            if (!data.accessToken) throw new Error("No token returned");

            await retellClient.startCall({
                accessToken: data.accessToken,
            });

        } catch (error: any) {
            console.error("Call failed:", error);
            alert(`Voice Call Failed: ${error.message}`);
            setIsCalling(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#080C16]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="/berinia-logo.png"
                            alt="BerinIA Logo"
                            onError={(e) => {
                                // Fallback if logo missing
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                            className="h-10 w-auto object-contain"
                        />
                        <span className="hidden text-white font-bold text-xl font-heading ml-2">BerinIA</span>
                    </div>
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
                </div>

                {/* Right: Phone Mockup */}
                <div id="demo" className="flex-1 w-full max-w-[400px] lg:max-w-md relative">
                    {/* Phone Frame - Thinner Borders (8px) */}
                    <div className="relative mx-auto border-neutral-900 bg-neutral-900 border-[8px] rounded-[2.5rem] h-[700px] w-[350px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10 transform duration-500 hover:scale-[1.01]">
                        {/* Buttons */}
                        <div className="h-[32px] w-[3px] bg-neutral-800 absolute -start-[11px] top-[72px] rounded-s-lg"></div>
                        <div className="h-[46px] w-[3px] bg-neutral-800 absolute -start-[11px] top-[124px] rounded-s-lg"></div>
                        <div className="h-[46px] w-[3px] bg-neutral-800 absolute -start-[11px] top-[178px] rounded-s-lg"></div>
                        <div className="h-[64px] w-[3px] bg-neutral-800 absolute -end-[11px] top-[142px] rounded-e-lg"></div>

                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative flex flex-col">

                            {/* Status Bar */}
                            <div className="h-6 bg-black text-white text-[10px] px-4 flex items-center justify-between z-20 shrink-0">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                                </div>
                            </div>

                            {/* --- REAL WEBSITE IFRAME --- */}
                            <div className="flex-1 bg-white relative overflow-hidden" onClick={() => isChatOpen && setIsChatOpen(false)}>
                                <iframe
                                    src={project.URL}
                                    className="w-full h-full border-none bg-white"
                                    title="Client Website Preview"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                    loading="lazy"
                                />
                                {/* Click overlay to close chat if open, but allow interaction if chat is closed. 
                                    Actually, if chat is open, we want to click backdrop to close. 
                                    The iframe eats clicks. We need a transparent div on top ONLY when chat is open? 
                                    Or just rely on the close button. 
                                    Let's adding a click overlay z-index when chat is open.
                                */}
                                {isChatOpen && (
                                    <div
                                        className="absolute inset-0 z-20 bg-black/10 backdrop-blur-[1px]"
                                        onClick={() => setIsChatOpen(false)}
                                    />
                                )}
                            </div>

                            {/* --- CHAT OVERLAY (Conditional) --- */}
                            {/* It covers 85% of screen when open */}
                            {isChatOpen && (
                                <div className="absolute inset-x-0 bottom-0 top-[12%] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-500 ease-out z-30 ring-1 ring-black/5">
                                    <div className="relative flex-1 bg-white flex flex-col h-full">
                                        {/* Close Button Overlay */}
                                        <button
                                            onClick={() => setIsChatOpen(false)}
                                            className="absolute top-4 right-4 z-50 p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors shadow-sm"
                                        >
                                            <X size={16} />
                                        </button>

                                        <ChatWidget
                                            agentId={project.AgentID}
                                            companyName={project.CompanyName}
                                            isEmbedded={true}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- VOICE OVERLAY (When Active) --- */}
                            {isCallActive && (
                                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-white animate-in fade-in duration-300 backdrop-blur-sm">
                                    <div className="mb-8 w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse ring-4 ring-primary/10">
                                        <Mic className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-heading mb-2">Voice Demo Active</h3>
                                    <p className="text-white/60 mb-8 text-center px-6">Listening...</p>
                                    <button
                                        onClick={toggleVoice}
                                        className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-colors shadow-lg hover:shadow-red-500/25"
                                    >
                                        <PhoneOff className="w-5 h-5" /> End Call
                                    </button>
                                </div>
                            )}

                            {/* --- FAB TRIGGERS --- */}
                            {/* Only show when not in call */}
                            {!isCallActive && (
                                <div className="absolute bottom-5 right-5 z-40 flex flex-col gap-4 items-end pointer-events-none">

                                    {/* Voice FAB (Small & Subtle) */}
                                    <button
                                        onClick={() => {
                                            if (!isChatOpen) setIsChatOpen(true);
                                            toggleVoice();
                                        }}
                                        disabled={isCalling}
                                        className="pointer-events-auto w-12 h-12 rounded-full bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-white/10 group hover:bg-black"
                                        title="Test Voice Agent"
                                    >
                                        {isCalling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5 group-hover:text-primary transition-colors" />}
                                    </button>

                                    {/* Chat FAB (If closed) */}
                                    {!isChatOpen && (
                                        <button
                                            onClick={() => setIsChatOpen(true)}
                                            className="pointer-events-auto w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all hover:bg-primary/90 hover:shadow-primary/25"
                                        >
                                            <div className="relative">
                                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-primary"></div>
                                                <MessageCircle size={26} />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Decorative blobs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
                </div>

            </main>

            {/* Calendar Section */}
            <section id="calendar" className="w-full bg-background py-24 border-t border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl font-bold mb-4 text-white font-heading">Ready to implement this?</h2>
                    <p className="text-slate-400 mb-12 font-sans">Book a time with us to discuss your custom AI integration.</p>
                    <div className="w-full h-[650px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center">
                        <iframe
                            src="https://cal.com/berinia-ukf1ty/berinia-demo"
                            className="w-full h-full"
                            title="Book a meeting"
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>
    );
}

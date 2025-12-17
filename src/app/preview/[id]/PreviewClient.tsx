'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Phone, Mic, PhoneOff } from 'lucide-react';
import { ProjectData, Lead } from '@/lib/types';
import { CustomTextAgent } from '@/components/CustomTextAgent';
import { RetellWebClient } from 'retell-client-js-sdk';

const retellWebClient = new RetellWebClient();

export function PreviewClient({ project, prospectId, lead }: { project: ProjectData; prospectId: string; lead?: Lead | null }) {
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Construct Cal.com URL with pre-filled data
    let calUrl = "https://cal.com/berinia/demo?layout=month_view&timeFormat=12";
    if (lead) {
        const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
        if (name) calUrl += `&name=${encodeURIComponent(name)}`;
        if (lead.email) calUrl += `&email=${encodeURIComponent(lead.email)}`;
        if (lead.phone) calUrl += `&phone=${encodeURIComponent(lead.phone)}`;
        if (lead.companyName) calUrl += `&notes=${encodeURIComponent("Company: " + lead.companyName)}`;
    }

    console.log('[Preview Debug] Final Cal URL:', calUrl);

    // Use Ref for stable client instance across renders
    const retellWebClientRef = useRef<RetellWebClient | null>(null); // Keeping this for safety but restoring global mainly

    // Retell Agent ID logic
    const agentId = project.AgentID || process.env.NEXT_PUBLIC_VOICE_AGENT_ID;

    // Voice Call State
    const [isCalling, setIsCalling] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Initialize Retell Client Listeners
    useEffect(() => {
        // We use the global instance now as requested "before error"
        retellWebClient.on('call_started', () => {
            console.log('Call started');
            setIsCalling(true);
        });

        retellWebClient.on('call_ended', () => {
            console.log('Call ended event received');
            // Force update in next tick to ensure UI refresh
            setTimeout(() => {
                setIsCalling(() => false);
                setIsConnecting(() => false);
                console.log('UI state forced to disconnected');
            }, 0);
        });

        retellWebClient.on('error', (error) => {
            console.error('Retell Client Error:', error);
            setIsCalling(false);
        });

        // Cleanup listeners
        return () => {
            retellWebClient.removeAllListeners();
        };
    }, []);

    const handleVoiceCall = async () => {
        // Use Global Instance
        if (isCalling) {
            retellWebClient.stopCall();
            setIsCalling(false); // Force state reset immediately
            return;
        }

        setIsConnecting(true);

        try {
            // 1. Get Access Token
            const res = await fetch('/api/register-call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: agentId,
                    dynamicVariables: {
                        business_name: project.CompanyName || "Berinia",
                        prospectId: prospectId
                    }
                })
            });

            const data = await res.json();
            if (!data.access_token) throw new Error('No access token');

            // 2. Start Call
            console.log('Initializing Retell Web Client with token...');
            await retellWebClient.startCall({
                accessToken: data.access_token
            });
            console.log('startCall() promise resolved - forcing UI update');

            // Force UI update securely in case event listener missed it
            setIsConnecting(false);
            setIsCalling(true);

        } catch (err: any) {
            console.error('Failed to start call:', err);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                alert('Microphone access denied. Please allow microphone access to use this feature.');
            } else {
                alert('Could not start call. Please check your internet or try again.');
            }

            setIsConnecting(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShowCalendar(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (calendarRef.current) {
            observer.observe(calendarRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // --- CLEANUP: Retell Widget, Voice Logic, and FABs REMOVED ---

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
                        <button
                            onClick={handleVoiceCall}
                            disabled={isConnecting}
                            className={`px-8 py-4 rounded-full font-semibold shadow-lg transition hover:shadow-xl font-heading flex items-center gap-3 w-fit disabled:opacity-80 disabled:cursor-not-allowed ${isConnecting
                                ? 'bg-neutral-600 text-white cursor-wait' // Distinct Grey for Loading
                                : isCalling
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-primary hover:bg-primary/90 text-white animate-vibrate-ring'
                                }`}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Connecting...
                                </>
                            ) : isCalling ? (
                                <>
                                    <PhoneOff className="w-5 h-5 fill-current" />
                                    End Call
                                </>
                            ) : (
                                <>
                                    <Phone className="w-5 h-5 fill-current" />
                                    Try your Voice Agent
                                </>
                            )}
                        </button>
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

                        <div
                            style={{ transform: 'translateZ(0)' }}
                            className="rounded-[1.7rem] overflow-hidden w-full h-full bg-white relative flex flex-col"
                        >

                            {/* Status Bar */}
                            <div className="h-6 bg-black text-white text-[10px] px-4 flex items-center justify-between z-20 shrink-0">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                                </div>
                            </div>

                            {/* --- REAL WEBSITE IFRAME --- */}
                            <div className="flex-1 bg-white relative overflow-hidden">
                                <iframe
                                    src={project.URL?.match(/^https?:\/\//) ? project.URL : `https://${project.URL}`}
                                    className="h-full border-none bg-white"
                                    style={{ width: 'calc(100% + 20px)' }} // Hack: Push scrollbar off-screen 
                                    title="Client Website Preview"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                    loading="lazy"
                                />
                            </div>

                            {/* NO WIDGETS, NO BUTTONS */}


                            {/* Custom Text Chat Agent */}
                            <CustomTextAgent
                                agentId={agentId || ''}
                                companyName={project.CompanyName || 'BerinIA'}
                                prospectId={prospectId}
                            />

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
                    <div
                        ref={calendarRef}
                        className="w-full h-[650px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center"
                    >
                        {showCalendar ? (
                            <iframe
                                src={calUrl}
                                className="w-full h-full"
                                title="Book a meeting"
                                loading="lazy"
                            ></iframe>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span>Loading Calendar...</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

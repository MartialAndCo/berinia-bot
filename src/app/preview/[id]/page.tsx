
import { getProject } from '@/lib/airtable';
import { ChatWidget } from '@/components/ChatWidget';
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
                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                            {/* The Chat Widget Embedded */}
                            <ChatWidget
                                agentId={project.AgentID}
                                companyName={project.CompanyName}
                                isEmbedded={true}
                            />
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

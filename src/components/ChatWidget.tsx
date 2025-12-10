
"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
}

interface ChatWidgetProps {
    agentId: string;
    companyName: string;
    initialMessage?: string;
    isEmbedded?: boolean;
}

export function ChatWidget({ agentId, companyName, initialMessage, isEmbedded = false }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(isEmbedded);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', role: 'agent', content: initialMessage || `Hi! I'm the AI assistant for ${companyName}. How can I help?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    message: userMsg.content,
                    chatId
                })
            });
            const data = await res.json();

            if (data.chatId) {
                setChatId(data.chatId);
            }

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: data.response || "I'm having trouble connecting."
            };
            setMessages(prev => [...prev, agentMsg]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: 'err', role: 'agent', content: "Sorry, connection error." }]);
        } finally {
            setLoading(false);
        }
    };

    // --- EMBEDDED VIEW (Phone Mockup) ---
    // Using explicit hex/classes to match BerinIA theme inside the mockup
    if (isEmbedded) {
        return (
            <div className="w-full h-full bg-white flex flex-col font-sans">
                {/* Header */}
                <div className="bg-[#080C16] text-white p-4 flex justify-between items-center shrink-0 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#7056F0] flex items-center justify-center text-white">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm font-heading">{companyName} Agent</h3>
                            <p className="text-xs text-neutral-400 font-sans">Powered by BerinIA</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/10 scroll-smooth">
                    {messages.map((m) => (
                        <div key={m.id} className={clsx("flex gap-2 text-sm", m.role === 'user' ? "justify-end" : "justify-start")}>
                            {m.role === 'agent' && (
                                <div className="w-6 h-6 rounded-full bg-[#7056F0]/20 text-[#7056F0] flex items-center justify-center shrink-0 mt-1">
                                    <Bot size={14} />
                                </div>
                            )}
                            <div className={clsx(
                                "px-4 py-2 rounded-2xl max-w-[85%] leading-relaxed font-sans",
                                m.role === 'user'
                                    ? "bg-[#7056F0] text-white rounded-br-none shadow-md"
                                    : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-none shadow-sm"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#7056F0]/20 flex items-center justify-center mt-1"><Bot size={14} /></div>
                            <div className="bg-white border border-neutral-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                                <Loader2 className="animate-spin text-neutral-400" size={16} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-neutral-100 shrink-0">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <input
                            className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7056F0]/20 placeholder:text-neutral-400 text-neutral-900"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="w-9 h-9 bg-[#080C16] text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- WIDGET VIEW (Floating Bubble) ---
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Same Header as embedded but floating */}
                    <div className="bg-[#080C16] text-white p-4 flex justify-between items-center border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#7056F0] flex items-center justify-center">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm font-heading">{companyName} Agent</h3>
                                <p className="text-xs text-neutral-400 font-sans">Powered by BerinIA</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md transition text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 scroll-smooth">
                        {messages.map((m) => (
                            <div key={m.id} className={clsx("flex gap-2 text-sm", m.role === 'user' ? "justify-end" : "justify-start")}>
                                {m.role === 'agent' && <div className="w-6 h-6 rounded-full bg-[#7056F0]/20 text-[#7056F0] flex items-center justify-center shrink-0 mt-1"><Bot size={14} /></div>}
                                <div className={clsx(
                                    "px-4 py-2 rounded-2xl max-w-[80%] leading-relaxed font-sans",
                                    m.role === 'user' ? "bg-[#7056F0] text-white rounded-br-none" : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-none shadow-sm"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#7056F0]/20 flex items-center justify-center mt-1"><Bot size={14} /></div>
                                <div className="bg-white border border-neutral-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                                    <Loader2 className="animate-spin text-neutral-400" size={16} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-neutral-100">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input
                                className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7056F0]/20 placeholder:text-neutral-400 text-neutral-900"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-9 h-9 bg-[#080C16] text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition disabled:opacity-50"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-[#080C16] text-white shadow-xl flex items-center justify-center hover:scale-105 transition-all active:scale-95 hover:bg-neutral-900 border border-white/10"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}

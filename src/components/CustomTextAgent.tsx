'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, User } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
}

interface CustomTextAgentProps {
    agentId: string;
    companyName: string;
    prospectId: string;
}

export function CustomTextAgent({ agentId, companyName, prospectId }: CustomTextAgentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    // Initial Greeting Fetch
    useEffect(() => {
        if (isOpen && !initializedRef.current && messages.length === 0) {
            initializedRef.current = true;
            setLoading(true);
            // Send empty message to trigger greeting/start
            fetch('/api/chat/retell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    message: "", // Empty message triggers greeting check
                    prospectId,
                    companyName
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.chatId) setChatId(data.chatId);
                    if (data.response) {
                        setMessages([{
                            id: 'init',
                            role: 'agent',
                            content: data.response
                        }]);
                    }
                })
                .catch(err => console.error('Greeting failed:', err))
                .finally(() => setLoading(false));
        }
    });

    // Auto-scroll to bottom of messages
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
            const res = await fetch('/api/chat/retell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    message: userMsg.content,
                    chatId, // Pass existing chatId if we have one
                    prospectId,
                    companyName
                })
            });

            if (!res.ok) throw new Error('Failed to send');

            const data = await res.json();

            // Save the chatId for future turns
            if (data.chatId && !chatId) {
                setChatId(data.chatId);
            }

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: data.response || "I didn't catch that, could you repeat?"
            };
            setMessages(prev => [...prev, agentMsg]);

        } catch (err) {
            console.error('Chat Error:', err);
            setMessages(prev => [...prev, {
                id: 'err',
                role: 'agent',
                content: "I'm having trouble connecting to the server. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-end justify-end p-4">
            {/* 
                Container is pointer-events-none to allow clicking fast-action buttons behind it if needed, 
                BUT we wrap interactables in pointer-events-auto 
             */}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-full max-w-[320px] h-[450px] bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto ring-1 ring-black/5">

                    {/* Header */}
                    <div className="bg-[#080C16] text-white p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-none font-heading">{companyName}</h3>
                                <p className="text-[10px] text-indigo-200 font-sans mt-0.5">AI Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
                        {messages.map((m) => (
                            <div key={m.id} className={clsx("flex gap-2 max-w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                                {m.role === 'agent' && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                                        <Bot size={12} className="text-indigo-600" />
                                    </div>
                                )}
                                <div className={clsx(
                                    "px-4 py-2.5 text-sm rounded-2xl leading-relaxed shadow-sm font-sans max-w-[80%]",
                                    m.role === 'user'
                                        ? "bg-indigo-600 text-white rounded-br-sm"
                                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                                )}>
                                    {m.content}
                                </div>
                                {m.role === 'user' && (
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                                        <User size={12} className="text-slate-500" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="flex justify-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                                    <Bot size={12} className="text-indigo-600" />
                                </div>
                                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white border-transparent focus:border-indigo-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 text-slate-800"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform pointer-events-auto z-50 ring-2 ring-white/20"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
}

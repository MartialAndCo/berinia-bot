'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface RetellOverlayProps {
    agentId: string;
}

export function RetellOverlay({ agentId }: RetellOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('[RetellOverlay] Init with agentId:', agentId);
        if (!agentId) return;

        const publicKey = process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY;
        if (!publicKey) return;

        // Cleanup existing script
        const existingScript = document.getElementById('retell-widget');
        if (existingScript) existingScript.remove();
        const existingWidget = document.querySelector('retell-widget');
        if (existingWidget) existingWidget.remove();

        // Create script
        const script = document.createElement('script');
        script.id = 'retell-widget';
        script.src = 'https://dashboard.retellai.com/retell-widget.js';
        script.type = 'module';
        script.setAttribute('data-public-key', publicKey);
        script.setAttribute('data-agent-id', agentId);
        script.setAttribute('data-auto-open', 'false');

        // We append to document.head so it initializes normally
        document.head.appendChild(script);

        return () => {
            const s = document.getElementById('retell-widget');
            if (s) s.remove();
            const w = document.querySelector('retell-widget');
            if (w) w.remove();
        };
    }, [agentId]);

    // Move the widget into container OR Proxy Click?
    // User reported "Unclickable" when moved.
    // Strategy: 
    // 1. Move the widget into the container so it's confined to the phone.
    // 2. Render a TRANSPARENT OVERLAY button on top of it to capture clicks?
    //    No, if the widget is unclickable, maybe it's occlusion.
    // 3. Let's try to MOVE it again, but this time ensure NO pointer-events: none on container.
    //    Wait, I already did that.

    // Fallback Strategy: Proxy Click.
    // We render a fake button. We hide the real widget (opacity 0). 
    // When fake button clicked -> we click the real widget.
    // AND: We effectively force the real widget to be inside our container so the chat opens inside.

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (node instanceof HTMLElement) {
                        if (node.tagName?.toLowerCase().includes('retell') ||
                            node.shadowRoot) {
                            if (containerRef.current && !containerRef.current.contains(node)) {
                                // Move it
                                containerRef.current.appendChild(node);

                                // Force styles on the moved node to ensure it fills or sits right
                                node.style.position = 'absolute';
                                node.style.bottom = '20px';
                                node.style.right = '20px';
                                node.style.zIndex = '50'; // Below our proxy button?
                                node.style.opacity = '0'; // Hide it visually, we use our button
                                node.style.pointerEvents = 'auto'; // Ensure it's interactive for our programmatic click?
                            }
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: false });
        return () => observer.disconnect();
    }, []);

    const handleProxyClick = () => {
        // Find the widget structure
        // Usually <retell-widget> -> shadowRoot -> button
        let widget = containerRef.current?.querySelector('retell-widget');

        if (!widget) {
            console.warn('Retell widget not found in container, searching globally...');
            widget = document.querySelector('retell-widget');
        }

        if (!widget) {
            console.error('Retell widget not found anywhere!');
            return;
        }

        console.log('Proxy click triggered. Widget:', widget);

        // Try all the ways to open it
        // 1. Shadow DOM button click
        if (widget.shadowRoot) {
            // Try to find the trigger button
            // Common selectors: button, .trigger, [role="button"]
            const button = widget.shadowRoot.querySelector('button') ||
                widget.shadowRoot.querySelector('[role="button"]') ||
                widget.shadowRoot.querySelector('.retell-floating-button'); // Guess

            if (button instanceof HTMLElement) {
                console.log('Found shadow button, clicking:', button);
                button.click();

                // Also, once opened, we might need to ensure the chat window is visible
                widget.style.opacity = '1';
                // But if we make it visible, the default button appears?
                // Maybe we only hide the button?
                // Hard to target just the button in shadow dom via CSS constant.
                return;
            }
        }

        // 2. Click the widget host itself?
        widget.click();
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-50 overflow-hidden"
            style={{
                transform: 'translateZ(0)',
                pointerEvents: 'none'
            }}
        >
            {/* Our Custom Proxy Button */}
            <button
                onClick={handleProxyClick}
                className="absolute bottom-5 right-5 w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform active:scale-95 z-[100] cursor-pointer pointer-events-auto"
                style={{ pointerEvents: 'auto' }}
            >
                <MessageSquare size={24} />
            </button>

            {/* Global style to force widget params if needed */}
            <style jsx global>{`
                retell-widget {
                    position: absolute !important;
                    bottom: 20px !important;
                    right: 20px !important;
                    z-index: 40 !important; /* Below proxy button */
                    opacity: 0; /* Hidden initially */
                }
                
                /* When chat is open, maybe class changes? or we just toggle opacity in JS */
            `}</style>
        </div>
    );
}

'use client';

import { useEffect, useRef } from 'react';

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
        // Ensure auto-open is false so it starts closed
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

    // Strategy: Move the Official Widget into the Container
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (node instanceof HTMLElement) {
                        // Look for the Retell Widget custom element
                        if (node.tagName?.toLowerCase() === 'retell-widget') {
                            if (containerRef.current && !containerRef.current.contains(node)) {
                                console.log('[RetellOverlay] Moving widget to container');
                                containerRef.current.appendChild(node);
                            }
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: false });

        // Initial check in case it's already there
        const alreadyThere = document.querySelector('retell-widget');
        if (alreadyThere && containerRef.current && !containerRef.current.contains(alreadyThere)) {
            console.log('[RetellOverlay] Moving existing widget to container');
            containerRef.current.appendChild(alreadyThere);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-50 overflow-hidden"
            style={{
                transform: 'translateZ(0)',
                pointerEvents: 'none' // Default: Click-through to iframe
            }}
        >
            {/* The official widget will be moved here. */}

            <style jsx global>{`
                /* Force pointer events on the widget when it arrives */
                retell-widget {
                    pointer-events: auto !important; /* ENABLE CLICKS */
                    position: absolute !important;
                    bottom: 20px !important;
                    right: 20px !important;
                    z-index: 9999 !important;
                }
            `}</style>
        </div>
    );
}

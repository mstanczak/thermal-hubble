import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { calculatePosition, type Placement } from '../../lib/positioning';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    placement?: Placement;
}

export function Tooltip({ content, children, placement: preferredPlacement = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ x: number, y: number, placement: Placement, arrowOffset: number } | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePosition = () => {
        if (triggerRef.current && contentRef.current) {
            const tempRect = contentRef.current.getBoundingClientRect();
            // If it's the first render of content, it might be hidden/zero size? 
            // Framer motion helps, but we might need to measure before animation starts or use a hidden state.
            // Since we use AnimatePresence, the element enters the DOM. We need to handle that layout effect.

            const pos = calculatePosition(
                triggerRef.current.getBoundingClientRect(),
                tempRect,
                preferredPlacement
            );
            setCoords(pos);
        }
    };

    // Recalculate on scroll/resize
    useEffect(() => {
        if (isVisible) {
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [isVisible]);

    // Calculate immediately when visible changes or content mounts
    useLayoutEffect(() => {
        if (isVisible) {
            updatePosition();
            // A small double-check in case the initial render size wasn't ready
            requestAnimationFrame(updatePosition);
        }
    }, [isVisible]);


    return (
        <>
            <div
                ref={triggerRef}
                className="relative inline-block"
                onMouseEnter={() => window.innerWidth >= 768 && setIsVisible(true)}
                onMouseLeave={() => window.innerWidth >= 768 && setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
            >
                {children}
            </div>

            {/* 
              Using Portal to ensure it breaks out of overflow:hidden parents and z-index contexts. 
              This is critical for "viewport awareness".
            */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            ref={contentRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                top: coords?.y ?? 0,
                                left: coords?.x ?? 0,
                            }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: 'fixed', // Use fixed to align with viewport coordinates
                                zIndex: 9999,
                                // Prevent flash of wrong position by hiding until coords are calculated
                                visibility: coords ? 'visible' : 'hidden'
                            }}
                            className="px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-xl w-max max-w-xs whitespace-normal text-center pointer-events-none md:pointer-events-auto"
                        >
                            {content}

                            {/* Arrow */}
                            {coords && (
                                <div
                                    className="absolute w-3 h-3 bg-gray-900 rotate-45 transform"
                                    style={{
                                        // Position arrow based on placement
                                        top: coords.placement === 'bottom' ? -4 : (coords.placement === 'left' || coords.placement === 'right' ? coords.arrowOffset - 6 : undefined),
                                        bottom: coords.placement === 'top' ? -4 : undefined,
                                        left: coords.placement === 'top' || coords.placement === 'bottom' ? coords.arrowOffset - 6 : (coords.placement === 'right' ? -4 : undefined),
                                        right: coords.placement === 'left' ? -4 : undefined,
                                    }}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

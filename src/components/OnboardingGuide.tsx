import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { calculatePosition, type PositionResult } from '../lib/positioning';

interface OnboardingGuideProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    isComplianceVerified: boolean;
}

// --- Helpers for Arrow Rendering ---
function getArrowDirection(placement: 'top' | 'bottom' | 'left' | 'right') {
    switch (placement) {
        case 'top': return 'down'; // Popover is TOP, so arrow points DOWN to target
        case 'bottom': return 'up'; // Popover is BOTTOM, so arrow points UP to target
        case 'left': return 'right';
        case 'right': return 'left';
    }
}

function getArrowPositionStyle(placement: 'top' | 'bottom' | 'left' | 'right', offset: number): React.CSSProperties {
    // The arrow is 40x40. We need to center it on the edge.
    // Offset is the center point relative to the popover edge.
    const ARROW_SIZE = 40;
    const CENTER_OFFSET = ARROW_SIZE / 2;

    switch (placement) {
        case 'top':
            return { bottom: -30, left: offset - CENTER_OFFSET };
        case 'bottom':
            return { top: -30, left: offset - CENTER_OFFSET };
        case 'left':
            return { right: -30, top: offset - CENTER_OFFSET };
        case 'right':
            return { left: -30, top: offset - CENTER_OFFSET };
    }
}

export function OnboardingGuide({ currentPage, onNavigate, isComplianceVerified }: OnboardingGuideProps) {
    // --- State & Refs (Must be top level) ---
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [settingsRect, setSettingsRect] = useState<DOMRect | null>(null);
    const [inputRect, setInputRect] = useState<DOMRect | null>(null);
    const [saveBtnRect, setSaveBtnRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [popoverCoords, setPopoverCoords] = useState<PositionResult | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // --- Helpers ---
    const updatePosition = () => {
        if (!popoverRef.current) return;

        const popoverRect = popoverRef.current.getBoundingClientRect();
        let targetRect: DOMRect | null = null;
        let preferredPlacement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

        if (step === 1 && settingsRect) {
            targetRect = settingsRect;
            preferredPlacement = 'bottom';
        } else if (step === 2 && inputRect) {
            targetRect = inputRect;
            preferredPlacement = 'right';
        } else if (step === 3 && saveBtnRect) {
            targetRect = saveBtnRect;
            preferredPlacement = 'top';
        }

        if (targetRect) {
            // Increased offset to account for the bouncing arrow (approx 40px height) + padding
            const pos = calculatePosition(targetRect, popoverRect, preferredPlacement, 50);
            setPopoverCoords(pos);
        }
    };

    const handleSkip = () => {
        setIsVisible(false);
        localStorage.setItem('onboarding_completed', 'skipped');
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('onboarding_completed', 'true');
    };

    // --- Effects ---

    // 1. Initial State Check & Mobile Detection
    useEffect(() => {
        const apiKey = localStorage.getItem('gemini_api_key');
        const onboardingCompleted = localStorage.getItem('onboarding_completed');

        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        if (isComplianceVerified && !apiKey && !onboardingCompleted) {
            setIsVisible(true);
            setStep(1);
        } else if (onboardingCompleted === 'reset') {
            setIsVisible(true);
            setStep(1);
            localStorage.removeItem('onboarding_completed');
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, [isComplianceVerified]);

    // Track Step 1 Element
    useEffect(() => {
        if (!isMobile && step === 1) {
            const updateRect = () => {
                const el = document.getElementById('onboarding-settings-btn');
                if (el) setSettingsRect(el.getBoundingClientRect());
            };
            setTimeout(updateRect, 500);
            window.addEventListener('resize', updateRect);
            return () => window.removeEventListener('resize', updateRect);
        }
    }, [step, isVisible, isMobile]);

    // Track Step 2 Element
    useEffect(() => {
        if (!isMobile && step === 2 && currentPage === 'settings') {
            const updateRect = () => {
                const el = document.getElementById('onboarding-api-key-input');
                if (el) setInputRect(el.getBoundingClientRect());
            };
            setTimeout(updateRect, 500);
            window.addEventListener('resize', updateRect);
            return () => window.removeEventListener('resize', updateRect);
        }
    }, [step, currentPage, isMobile]);

    // Track Step 3 Element (Save Button) with Scroll Logic
    useEffect(() => {
        if (!isMobile && step === 3 && currentPage === 'settings') {
            const updateRect = () => {
                const el = document.getElementById('onboarding-save-btn');
                if (el) {
                    setSaveBtnRect(el.getBoundingClientRect());
                    // Ensure visible
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };

            // Delay to allow DOM update
            setTimeout(updateRect, 300);

            window.addEventListener('resize', updateRect);
            // Listen for save click to complete
            const el = document.getElementById('onboarding-save-btn');
            if (el) {
                el.addEventListener('click', () => {
                    // Give it a moment to process the save
                    setTimeout(handleComplete, 1000);
                });
            }

            return () => {
                window.removeEventListener('resize', updateRect);
                if (el) el.removeEventListener('click', handleComplete); // Cleanup helper
            };
        }
    }, [step, currentPage, isMobile]);

    // Auto-advance logic
    useEffect(() => {
        if (step === 1 && currentPage === 'settings') {
            setStep(2);
        }
    }, [currentPage, step]);

    // Recalculate Popover Position
    useEffect(() => {
        if (!isMobile && isVisible) {
            requestAnimationFrame(updatePosition);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [isMobile, isVisible, step, settingsRect, inputRect, saveBtnRect]);

    // Force update when popover ref mounts
    useEffect(() => {
        if (popoverRef.current) {
            updatePosition();
        }
    });

    // --- Render ---

    if (!isVisible) return null;

    if (isMobile) {
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
                            <h3 className="text-xl font-bold mb-1">
                                {step === 1 ? "Welcome! 🚀" : "Power Up 🔑"}
                            </h3>
                            <p className="text-blue-100 text-sm">
                                {step === 1 ? "Step 1 of 2: Navigation" : "Step 2 of 2: Activation"}
                            </p>
                        </div>
                        <div className="p-6">
                            {step === 1 ? (
                                <>
                                    <p className="text-gray-600 mb-6 text-center leading-relaxed">
                                        Let's get you set up. First, tap the <strong>Settings</strong> icon (or the ⚙️ gear) in the top menu to configure your AI assistant.
                                    </p>
                                    <button
                                        onClick={() => onNavigate('settings')}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition"
                                    >
                                        Go to Settings
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-600 mb-4 text-center leading-relaxed">
                                        You need a <strong>Google Gemini API Key</strong>. It's free and private!
                                    </p>
                                    <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside mb-6 bg-gray-50 p-4 rounded-lg">
                                        <li>Tap the link below to get a key.</li>
                                        <li>Copy your new key.</li>
                                        <li>Paste it into the API Key field!</li>
                                    </ol>
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-3 text-center border-2 border-blue-600 text-blue-600 rounded-lg font-bold mb-3 hover:bg-blue-50 transition"
                                    >
                                        Get API Key <ExternalLink className="inline w-4 h-4 ml-1" />
                                    </a>
                                    <button
                                        onClick={handleComplete}
                                        className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition"
                                    >
                                        I've Pasted It!
                                    </button>
                                </>
                            )}
                            <button onClick={handleSkip} className="w-full py-4 text-gray-400 text-sm hover:text-gray-600">
                                Skip Tutorial
                            </button>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }

    // Desktop View
    return (
        <AnimatePresence>
            {/* Step 1: Overlay for Settings Button */}
            {step === 1 && settingsRect && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: settingsRect.top + (settingsRect.height / 2) - 20,
                            left: settingsRect.left + (settingsRect.width / 2) - 20,
                            width: 40,
                            height: 40,
                            zIndex: 50
                        }}
                        className="pointer-events-none flex items-center justify-center"
                    >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-custom-glow"></span>
                    </div>

                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            top: popoverCoords?.y ?? -1000,
                            left: popoverCoords?.x ?? -1000,
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        style={{
                            position: 'fixed',
                            zIndex: 60,
                            visibility: popoverCoords ? 'visible' : 'hidden'
                        }}
                        className="pointer-events-auto bg-blue-600 text-white p-5 rounded-xl shadow-2xl max-w-xs w-72"
                    >
                        {popoverCoords && (
                            <div
                                className="absolute w-4 h-4 bg-blue-600 rotate-45 transform"
                                style={{
                                    top: popoverCoords.placement === 'bottom' ? -6 : (popoverCoords.placement === 'left' || popoverCoords.placement === 'right' ? popoverCoords.arrowOffset - 8 : undefined),
                                    bottom: popoverCoords.placement === 'top' ? -6 : undefined,
                                    left: popoverCoords.placement === 'top' || popoverCoords.placement === 'bottom' ? popoverCoords.arrowOffset - 8 : (popoverCoords.placement === 'right' ? -6 : undefined),
                                    right: popoverCoords.placement === 'left' ? -6 : undefined,
                                }}
                            />
                        )}

                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            Setup Required ⚙️
                        </h3>
                        <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                            To use the AI features, you need to add your free Google API Key in Settings.
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-blue-500/30">
                            <button
                                onClick={handleSkip}
                                className="text-xs text-blue-200 hover:text-white transition-colors"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => onNavigate('settings')}
                                className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                Open Settings
                            </button>
                        </div>
                    </motion.div>
                </>
            )}

            {/* Step 2: Overlay for Input Field */}
            {step === 2 && inputRect && (
                <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        top: popoverCoords?.y ?? -1000,
                        left: popoverCoords?.x ?? -1000
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    style={{
                        position: 'fixed',
                        zIndex: 60,
                        visibility: popoverCoords ? 'visible' : 'hidden'
                    }}
                    className="pointer-events-auto w-80"
                >
                    <div className="bg-white rounded-xl shadow-2xl border border-blue-100 overflow-visible relative">
                        {popoverCoords && (
                            <div
                                className="absolute w-4 h-4 bg-white border border-blue-100 rotate-45 transform z-0"
                                style={{
                                    backgroundColor: popoverCoords.placement === 'bottom' ? '#2563eb' : 'white',
                                    borderColor: popoverCoords.placement === 'bottom' ? '#2563eb' : undefined,

                                    top: popoverCoords.placement === 'bottom' ? -6 : (popoverCoords.placement === 'left' || popoverCoords.placement === 'right' ? popoverCoords.arrowOffset - 8 : undefined),
                                    bottom: popoverCoords.placement === 'top' ? -6 : undefined,
                                    left: popoverCoords.placement === 'top' || popoverCoords.placement === 'bottom' ? popoverCoords.arrowOffset - 8 : (popoverCoords.placement === 'right' ? -6 : undefined),
                                    right: popoverCoords.placement === 'left' ? -6 : undefined,
                                }}
                            />
                        )}

                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative z-10 rounded-t-xl">
                            <h3 className="font-bold flex items-center gap-2">
                                Generate your Free Key 🔑
                            </h3>
                        </div>
                        <div className="p-4 bg-white relative z-10 rounded-b-xl">
                            <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside mb-4">
                                <li className="pl-1">
                                    Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                                        Google AI Studio <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                                <li className="pl-1">Sign in with Google.</li>
                                <li className="pl-1">Click <strong>"Create API key"</strong>.</li>
                                <li className="pl-1">Paste it right here! 👈</li>
                            </ol>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <button
                                    onClick={handleSkip}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Exit Guide
                                </button>
                                <button
                                    onClick={handleComplete}
                                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors"
                                >
                                    I've pasted it!
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

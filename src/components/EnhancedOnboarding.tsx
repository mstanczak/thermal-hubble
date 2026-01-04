import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface EnhancedOnboardingProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    isComplianceVerified: boolean;
}

const STEPS = [
    {
        id: 'intro',
        targetId: 'onboarding-settings-btn',
        title: "Welcome to Thermal Hubble",
        description: "Let's configure your AI assistant for hazardous materials compliance. It will only take a minute.",
        action: "Go to Settings",
    },
    {
        id: 'key',
        targetId: 'onboarding-api-key-input',
        title: "The Engine: API Key",
        description: "Your Google Gemini API Key powers the AI. It's the engine that drives all compliance checks.",
        action: "Get Key & Continue",
        link: "https://aistudio.google.com/app/apikey"
    },
    {
        id: 'models',
        targetId: 'onboarding-model-select',
        title: "Choose Your Model",
        description: "'Flash' models are fast and cost-effective. 'Pro' models are better for complex reasoning.",
        action: "Next Step"
    },
    {
        id: 'mcp',
        targetId: 'onboarding-mcp-section',
        title: "Connect External Rules",
        description: "MCP connects the AI to your company's private rulebook or external databases for better accuracy.",
        action: "Keep Going"
    },
    {
        id: 'autofill',
        targetId: 'onboarding-signatory-input',
        title: "Auto-Fill Defaults",
        description: "Save time by setting default signatory details. You won't have to type them every time.",
        action: "Almost Done"
    },
    {
        id: 'save',
        targetId: 'onboarding-save-btn',
        title: "Save Your Setup",
        description: "Don't forget to save! This commits your settings so you're ready to ship.",
        action: "Finish Setup"
    }
];

export function EnhancedOnboarding({ currentPage, onNavigate, isComplianceVerified }: EnhancedOnboardingProps) {
    const [stepIndex, setStepIndex] = useState(-1);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Position state for the card
    const [cardPosition, setCardPosition] = useState<{ top?: number | string; bottom?: number | string; left?: number | string; x?: string }>({
        top: '50%',
        left: '50%',
        x: '-50%' // Center by default
    });

    const currentStep = STEPS[stepIndex];
    const totalSteps = STEPS.length;
    const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

    // Initial check
    useEffect(() => {
        const apiKey = localStorage.getItem('gemini_api_key');
        const completed = localStorage.getItem('onboarding_completed');

        if (isComplianceVerified && !apiKey && !completed) {
            setIsVisible(true);
            setStepIndex(0);
        }
    }, [isComplianceVerified]);

    // Handle Scroll Locking & Positioning Loop
    useEffect(() => {
        if (!isVisible || stepIndex === -1) {
            document.body.style.overflow = '';
            return;
        }

        let scrollTimeout: any;
        let rectInterval: any;

        const setupStep = () => {
            // 1. Unlock scroll temporarily to allow movement
            document.body.style.overflow = '';

            // 2. Navigation check
            if (stepIndex > 0 && currentPage !== 'settings') {
                onNavigate('settings');
                // We'll retry setup in next render when currentPage updates
                return;
            }

            const el = document.getElementById(currentStep.targetId);

            if (el) {
                // 3. Scroll to element
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

                // 4. Update Rect continuously during scroll (for 1s)
                const startTime = Date.now();
                rectInterval = setInterval(() => {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);
                    updateCardPosition(rect);

                    // 5. Lock scroll after smooth scroll finishes (approx 800ms)
                    if (Date.now() - startTime > 800) {
                        document.body.style.overflow = 'hidden';
                        clearInterval(rectInterval);
                    }
                }, 50);
            } else {
                setTargetRect(null);
                setCardPosition({
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                });
                // Lock anyway to keep focus
                document.body.style.overflow = 'hidden';
            }
        };

        setupStep();

        // Resize handler to update position if window changes
        const handleResize = () => {
            const el = document.getElementById(currentStep?.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);
                updateCardPosition(rect);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            document.body.style.overflow = ''; // Cleanup on unmount/change
            clearTimeout(scrollTimeout);
            clearInterval(rectInterval);
            window.removeEventListener('resize', handleResize);
        };
    }, [stepIndex, currentPage, isVisible]);


    const updateCardPosition = (rect: DOMRect) => {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const cardHeight = 350; // Approx max height
        const cardWidth = 448; // max-w-md approx width
        const gap = 20;

        let pos: { top?: number; bottom?: number; left?: number; x?: string } = {};

        // Vertical Positioning
        // Prefer Bottom
        if (rect.bottom + gap + cardHeight < windowHeight) {
            pos.top = rect.bottom + gap;
        }
        // Try Top
        else if (rect.top - gap - cardHeight > 0) {
            pos.top = rect.top - gap - cardHeight;
        }
        // If neither fits well, check which has more space
        else {
            const spaceBelow = windowHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow > spaceAbove) {
                pos.top = rect.bottom + gap;
            } else {
                pos.top = Math.max(10, rect.top - gap - cardHeight);
            }
        }

        // Horizontal Positioning (Centering on target, but clamping to screen)
        // Center of target
        let left = rect.left + (rect.width / 2);

        // Clamp logic
        if (left < (cardWidth / 2) + 20) {
            left = (cardWidth / 2) + 20;
        }
        else if (left > windowWidth - (cardWidth / 2) - 20) {
            left = windowWidth - (cardWidth / 2) - 20;
        }

        pos.left = left;
        pos.x = '-50%';

        setCardPosition(pos as any);
    };


    const handleNext = () => {
        if (stepIndex < STEPS.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = () => {
        setIsVisible(false);
        document.body.style.overflow = '';
        localStorage.setItem('onboarding_completed', 'true');
    };

    if (!isVisible || stepIndex === -1) return null;

    // Mask Logic: Define interaction boundaries
    // We add padding around the target
    const PADDING = 10;
    const maskTopHeight = targetRect ? Math.max(0, targetRect.top - PADDING) : 0;
    const maskBottomTop = targetRect ? targetRect.bottom + PADDING : 0;
    const maskLeftWidth = targetRect ? Math.max(0, targetRect.left - PADDING) : 0;
    const maskRightLeft = targetRect ? targetRect.right + PADDING : 0;
    const maskMiddleHeight = targetRect ? targetRect.height + (PADDING * 2) : 0;

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <div className="fixed inset-0 z-[9999] pointer-events-none">

                    {/* 
                        INTERACTIVE MASK SYSTEM 
                        Instead of one giant overlay with a hole (which is hard to click through),
                        we use 4 surrounding divs that block clicks. The center "hole" remains empty DOM space,
                        allowing clicks to naturally fall through to the input beneath.
                    */}
                    {targetRect ? (
                        <>
                            {/* Top Mask */}
                            <motion.div
                                className="absolute left-0 right-0 bg-black/75 pointer-events-auto"
                                style={{ top: 0, height: maskTopHeight }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            />
                            {/* Bottom Mask */}
                            <motion.div
                                className="absolute left-0 right-0 bottom-0 bg-black/75 pointer-events-auto"
                                style={{ top: maskBottomTop }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            />
                            {/* Left Mask (middle band only) */}
                            <motion.div
                                className="absolute left-0 bg-black/75 pointer-events-auto"
                                style={{ top: maskTopHeight, height: maskMiddleHeight, width: maskLeftWidth }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            />
                            {/* Right Mask (middle band only) */}
                            <motion.div
                                className="absolute right-0 bg-black/75 pointer-events-auto"
                                style={{ top: maskTopHeight, height: maskMiddleHeight, left: maskRightLeft }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            />

                            {/* Visual Highlight Ring (Purely decorative, passes clicks) */}
                            <motion.div
                                className="absolute pointer-events-none border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-lg"
                                style={{
                                    top: targetRect.top - PADDING,
                                    left: targetRect.left - PADDING,
                                    width: targetRect.width + (PADDING * 2),
                                    height: targetRect.height + (PADDING * 2),
                                }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </>
                    ) : (
                        // Fallback full mask if no target
                        <div className="absolute inset-0 bg-black/75 pointer-events-auto" />
                    )}

                    {/* Content Card (Always accessible) */}
                    <motion.div
                        className="absolute w-full max-w-md px-4 pointer-events-auto"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            top: cardPosition.top,
                            left: cardPosition.left,
                            x: cardPosition.x,
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Step {stepIndex + 1} of {totalSteps}</span>
                                    <span className="text-xs font-medium text-white/80">{progress}% Complete</span>
                                </div>
                                <h2 className="text-xl font-bold mb-1">{currentStep.title}</h2>
                                <div className="h-1 w-full bg-black/20 rounded-full mt-3 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-white"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                <p className="text-gray-600 text-[15px] leading-relaxed mb-5">
                                    {currentStep.description}
                                </p>

                                {currentStep.link && (
                                    <a
                                        href={currentStep.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 font-semibold mb-5 hover:text-blue-800 transition-colors text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Link
                                    </a>
                                )}

                                <div className="flex gap-3">
                                    {stepIndex > 0 && stepIndex < totalSteps - 1 && (
                                        <button
                                            onClick={() => setStepIndex(prev => prev - 1)}
                                            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition text-sm"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                                    >
                                        {currentStep.action}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <button
                        onClick={() => {
                            if (confirm('Skip tutorial?')) completeOnboarding();
                        }}
                        className="fixed top-4 right-4 text-white/50 hover:text-white text-xs font-medium uppercase tracking-widest z-[10000] pointer-events-auto"
                    >
                        Skip
                    </button>
                </div>
            )}
        </AnimatePresence>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface OnboardingGuideProps {
    currentPage: string;
    onNavigate: (page: any) => void;
    isComplianceVerified: boolean;
}

export function OnboardingGuide({ currentPage, onNavigate, isComplianceVerified }: OnboardingGuideProps) {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [settingsRect, setSettingsRect] = useState<DOMRect | null>(null);
    const [inputRect, setInputRect] = useState<DOMRect | null>(null);

    // Initial Check
    useEffect(() => {
        const apiKey = localStorage.getItem('gemini_api_key');
        const onboardingCompleted = localStorage.getItem('onboarding_completed');

        // Trigger condition: Compliance verified AND no API key AND not previously completed/skipped
        if (isComplianceVerified && !apiKey && !onboardingCompleted) {
            setIsVisible(true);
            setStep(1);
        } else if (onboardingCompleted === 'reset') {
            // Manual restart trigger
            setIsVisible(true);
            setStep(1);
            localStorage.removeItem('onboarding_completed'); // Clear the flag so it behaves normally
        }
    }, [isComplianceVerified]);

    // Track Step 1 Element (Settings Button)
    useEffect(() => {
        if (step === 1) {
            const updateRect = () => {
                const el = document.getElementById('onboarding-settings-btn');
                if (el) {
                    setSettingsRect(el.getBoundingClientRect());
                }
            };

            // Wait for layout
            setTimeout(updateRect, 500);
            window.addEventListener('resize', updateRect);
            return () => window.removeEventListener('resize', updateRect);
        }
    }, [step, isVisible]);

    // Track Step 2 Element (Input)
    useEffect(() => {
        if (step === 2 && currentPage === 'settings') {
            const updateRect = () => {
                const el = document.getElementById('onboarding-api-key-input');
                if (el) {
                    setInputRect(el.getBoundingClientRect());
                }
            };

            setTimeout(updateRect, 500);
            window.addEventListener('resize', updateRect);
            return () => window.removeEventListener('resize', updateRect);
        }
    }, [step, currentPage]);

    // Auto-advance logic
    useEffect(() => {
        if (step === 1 && currentPage === 'settings') {
            setStep(2);
        }
    }, [currentPage, step]);

    const handleSkip = () => {
        setIsVisible(false);
        localStorage.setItem('onboarding_completed', 'skipped');
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('onboarding_completed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {/* Step 1: Overlay for Settings Button */}
            {/* Step 1: Overlay for Settings Button */}
            {step === 1 && settingsRect && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 pointer-events-none"
                >
                    {/* Pulsing Beacon on the actual button */}
                    <div
                        style={{
                            position: 'absolute',
                            top: settingsRect.top + (settingsRect.height / 2) - 20,
                            left: settingsRect.left + (settingsRect.width / 2) - 20,
                            width: 40,
                            height: 40,
                        }}
                        className="pointer-events-none flex items-center justify-center"
                    >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </div>

                    {/* Simple Popover Bubble */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        style={{
                            position: 'absolute',
                            top: settingsRect.bottom + 16,
                            right: window.innerWidth - settingsRect.right, // Align right edges
                        }}
                        className="pointer-events-auto bg-blue-600 text-white p-5 rounded-xl shadow-xl max-w-xs w-72 relative origin-top-right"
                    >
                        {/* CSS Arrow pointing UP at the settings gear */}
                        <div
                            className="absolute -top-2 right-3 w-4 h-4 bg-blue-600 rotate-45"
                            style={{ borderRadius: '2px' }}
                        />

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
                </motion.div>
            )}

            {/* Step 2: Overlay for Input Field */}
            {step === 2 && inputRect && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 pointer-events-none"
                >
                    {/* Spotlight / Popover */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            position: 'absolute',
                            top: inputRect.top,
                            left: inputRect.right + 20,
                        }}
                        className="pointer-events-auto w-80"
                    >
                        <div className="bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                                <h3 className="font-bold flex items-center gap-2">
                                    Generate your Free Key 🔑
                                </h3>
                            </div>
                            <div className="p-4 bg-white">
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

                            {/* Connector Arrow */}
                            <div className="absolute top-6 -left-2 w-4 h-4 bg-blue-600 rotate-45 transform" />
                        </div>
                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}

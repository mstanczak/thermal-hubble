import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Bot, Scale, X, Check } from 'lucide-react';

interface ComplianceBannerProps {
    onAccept: () => void;
}

export function ComplianceBanner({ onAccept }: ComplianceBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    // Constants
    const STORAGE_KEY = 'thermal_hubble_compliance_acknowledged';
    const STORAGE_MSG = "Your data stays with you! We store everything locally in your browser, not on our servers.";
    const AI_TERMS_MSG = "We use Gemini AI to help. Please review their Terms & Service before diving in.";
    const ESTIMATES_MSG = "Heads up: Rates and compliance rules are estimates. Always verify with official regs!";

    useEffect(() => {
        const acknowledged = localStorage.getItem(STORAGE_KEY);
        if (acknowledged) {
            setIsVisible(false);
            onAccept(); // Ensure parent knows it's already accepted if immediate effect logic didn't catch it
            // actually, parent should check LS too, but this is a safety.
            // Better pattern: Parent checks LS for initial state. Component just handles the UI interaction.
        }
    }, [onAccept]);

    const handleAccept = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
        onAccept();
    };

    const handleClose = () => {
        // "Once a user clicks 'Accept' or the 'X,' use localStorage..."
        // So X also approves the compliance flow for "interaction".
        handleAccept();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-5xl"
                >
                    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-2xl p-6 md:p-4">
                        {/* Glassmorphism gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 pointer-events-none" />

                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">

                                {/* Privacy */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100/80 rounded-lg text-blue-600 shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium leading-tight">
                                        {STORAGE_MSG}
                                    </p>
                                </div>

                                {/* AI Terms */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-100/80 rounded-lg text-purple-600 shrink-0">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium leading-tight">
                                        {AI_TERMS_MSG}
                                    </p>
                                </div>

                                {/* Estimates */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100/80 rounded-lg text-amber-600 shrink-0">
                                        <Scale className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium leading-tight">
                                        {ESTIMATES_MSG}
                                    </p>
                                </div>

                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 w-full md:w-auto pl-0 md:pl-4 border-l border-white/0 md:border-gray-200/50">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                                >
                                    <Check className="w-4 h-4" />
                                    Accept & Continue
                                </button>

                                <button
                                    onClick={handleClose}
                                    className="p-2.5 bg-gray-100/50 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 rounded-xl transition-colors backdrop-blur-sm"
                                    aria-label="Close banner"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

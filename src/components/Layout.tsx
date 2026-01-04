import React, { useState } from 'react';
import { ShieldCheck, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
    onSettingsClick?: () => void;
    onDocumentationClick?: () => void;
    onSupportClick?: () => void;
    onLogoClick?: () => void;
    onComplianceClick?: () => void;
}

export function Layout({ children, onSettingsClick, onDocumentationClick, onSupportClick, onLogoClick, onComplianceClick }: LayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
                            Hazmat<span className="text-blue-600">Validator</span>
                        </h1>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight sm:hidden">
                            HV
                        </h1>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4">
                        <button onClick={onDocumentationClick} className="text-sm font-medium text-gray-600 hover:text-gray-900">Documentation</button>
                        <button onClick={onSupportClick} className="text-sm font-medium text-gray-600 hover:text-gray-900">Support</button>

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        <button
                            onClick={onComplianceClick}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            title="Compliance & Safety"
                        >
                            <span role="img" aria-label="shield" className="text-lg">🛡️</span>
                        </button>

                        {/* Help / Restart Onboarding */}
                        <button
                            onClick={() => {
                                localStorage.setItem('onboarding_completed', 'reset');
                                window.location.reload();
                            }}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            title="Restart Onboarding Guide"
                        >
                            <span role="img" aria-label="bulb" className="text-lg">💡</span>
                        </button>

                        {onSettingsClick && (
                            <button
                                id="onboarding-settings-btn"
                                onClick={onSettingsClick}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3 md:hidden">
                        {/* Essentials needed on mobile bar */}
                        <button
                            onClick={onComplianceClick}
                            className="text-gray-600 p-1"
                            title="Compliance & Safety"
                        >
                            <span role="img" aria-label="shield" className="text-lg">🛡️</span>
                        </button>
                        {(onSettingsClick) && (
                            <button
                                id="onboarding-settings-btn-mobile"
                                onClick={onSettingsClick}
                                className="text-gray-600 p-1"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-b border-gray-200 bg-white overflow-hidden"
                        >
                            <div className="px-4 py-4 flex flex-col gap-4">
                                <button onClick={() => { setIsMenuOpen(false); onDocumentationClick?.(); }} className="text-left text-sm font-medium text-gray-600 hover:text-gray-900 py-2 border-b border-gray-50">Documentation</button>
                                <button onClick={() => { setIsMenuOpen(false); onSupportClick?.(); }} className="text-left text-sm font-medium text-gray-600 hover:text-gray-900 py-2 border-b border-gray-50">Support</button>

                                <button
                                    onClick={() => {
                                        localStorage.setItem('onboarding_completed', 'reset');
                                        window.location.reload();
                                    }}
                                    className="text-left text-sm font-medium text-gray-600 hover:text-gray-900 py-2 flex items-center gap-2"
                                >
                                    <span role="img" aria-label="bulb">💡</span> Restart Onboarding
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Hazmat Validator. Not affiliated with FedEx or UPS.
                    <p className="mt-2 text-xs text-gray-400">
                        Disclaimer: This tool is for informational purposes only. AI-generated suggestions are experimental and should not be used as the sole basis for hazardous materials compliance. The developer and AI providers disclaim all liability for any damages resulting from the use of this software. Always verify with the latest 49 CFR or IATA DGR manuals.
                    </p>
                </div>
            </footer>
        </div>
    );
}

import React from 'react';
import { ShieldCheck, Settings } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    onSettingsClick?: () => void;
}

export function Layout({ children, onSettingsClick }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            Hazmat<span className="text-blue-600">Validator</span>
                        </h1>
                    </div>
                    <nav className="flex items-center gap-4">
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Documentation</a>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Support</a>
                        {onSettingsClick && (
                            <button
                                onClick={onSettingsClick}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Hazmat Validator. Not affiliated with FedEx or UPS.
                </div>
            </footer>
        </div>
    );
}

import { X, ExternalLink, Key } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Key className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">API Key Required</h3>
                    </div>
                    <p className="text-blue-100 text-sm">
                        To use AI features like validation and suggestions, you need to configure a Google Gemini API key.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">How to get a free API key:</h4>
                        <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
                            <li className="pl-1">
                                Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                                    Google AI Studio <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                            <li className="pl-1">Sign in with your Google account.</li>
                            <li className="pl-1">Click <strong>"Create API key"</strong>.</li>
                            <li className="pl-1">Copy the key and paste it in the Settings panel.</li>
                        </ol>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                        <strong>Note:</strong> Your API key is stored locally in your browser and is never sent to our servers.
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                        >
                            I'll add it in Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

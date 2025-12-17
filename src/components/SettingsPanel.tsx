import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export function SettingsPanel() {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');
    const [suggestionModel, setSuggestionModel] = useState('gemini-3-flash-preview');
    const [validationModel, setValidationModel] = useState('gemini-2.5-flash');
    const [ocrModel, setOcrModel] = useState('gemini-3-flash-preview');
    const [signatoryName, setSignatoryName] = useState('');
    const [signatoryTitle, setSignatoryTitle] = useState('');
    const [signatoryPlace, setSignatoryPlace] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [offerorName, setOfferorName] = useState('');

    const MODELS = [
        { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', description: 'Fastest reasoning. Best for speed.' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Newest fast model. Best for suggestions.' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and cost-effective. Good for general tasks.' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High performance. Best for complex reasoning.' },
        { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash Thinking', description: 'Enhanced reasoning capabilities.' },
        { id: 'models/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', description: 'Latest experimental model.' },
    ];

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        }

        // Load models with fallback to legacy setting or default
        const legacyModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

        const storedSuggestionModel = localStorage.getItem('gemini_model_suggestions');
        setSuggestionModel(storedSuggestionModel || 'gemini-3-flash-preview');

        const storedValidationModel = localStorage.getItem('gemini_model_validation');
        setValidationModel(storedValidationModel || legacyModel);

        const storedOcrModel = localStorage.getItem('gemini_model_ocr');
        setOcrModel(storedOcrModel || 'gemini-3-flash-preview');

        const storedName = localStorage.getItem('default_signatory_name');
        if (storedName) {
            setSignatoryName(storedName);
        }
        const storedTitle = localStorage.getItem('default_signatory_title');
        if (storedTitle) {
            setSignatoryTitle(storedTitle);
        }
        const storedPlace = localStorage.getItem('default_signatory_place');
        if (storedPlace) {
            setSignatoryPlace(storedPlace);
        }
        const storedPhone = localStorage.getItem('default_emergency_phone');
        if (storedPhone) {
            setEmergencyPhone(storedPhone);
        }
        const storedOfferor = localStorage.getItem('default_offeror_name');
        if (storedOfferor) {
            setOfferorName(storedOfferor);
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
            localStorage.setItem('gemini_model_suggestions', suggestionModel);
            localStorage.setItem('gemini_model_validation', validationModel);
            localStorage.setItem('gemini_model_ocr', ocrModel);

            // Keep legacy key updated for safety/compatibility during migration
            localStorage.setItem('gemini_model', suggestionModel);

            localStorage.setItem('default_signatory_name', signatoryName.trim());
            localStorage.setItem('default_signatory_title', signatoryTitle.trim());
            localStorage.setItem('default_signatory_place', signatoryPlace.trim());
            localStorage.setItem('default_emergency_phone', emergencyPhone.trim());
            localStorage.setItem('default_offeror_name', offerorName.trim());
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleClear = () => {
        localStorage.removeItem('gemini_api_key');
        localStorage.removeItem('gemini_model');
        localStorage.removeItem('gemini_model_suggestions');
        localStorage.removeItem('gemini_model_validation');
        localStorage.removeItem('gemini_model_ocr');

        localStorage.removeItem('default_signatory_name');
        localStorage.removeItem('default_signatory_title');
        localStorage.removeItem('default_signatory_place');
        localStorage.removeItem('default_emergency_phone');
        localStorage.removeItem('default_offeror_name');
        setApiKey('');
        setSuggestionModel('gemini-2.5-flash');
        setValidationModel('gemini-2.5-flash');
        setOcrModel('gemini-2.5-flash');
        setSignatoryName('');
        setSignatoryTitle('');
        setSignatoryPlace('');
        setEmergencyPhone('');
        setOfferorName('');
        setStatus('cleared');
        setTimeout(() => setStatus('idle'), 2000);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">AI Configuration</h2>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'saved' && <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved</span>}
                    {status === 'cleared' && <span className="text-gray-500 text-sm flex items-center gap-1"><Trash2 className="w-4 h-4" /> Cleared</span>}
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Enter your Google Gemini API Key to enable AI-powered compliance validation.
                The key is stored locally in your browser and never sent to our servers.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter Gemini API Key"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions Model</label>
                        <select
                            value={suggestionModel}
                            onChange={(e) => setSuggestionModel(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            {MODELS.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">For field auto-complete</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validation Model</label>
                        <select
                            value={validationModel}
                            onChange={(e) => setValidationModel(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            {MODELS.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">For shipment validation</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">OCR Model</label>
                        <select
                            value={ocrModel}
                            onChange={(e) => setOcrModel(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            {MODELS.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">For SDS document reading</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Default Signatory Information (Air Shipments)</h3>
                    <p className="text-xs text-gray-600 mb-3">
                        These values will auto-populate when creating air shipments.
                    </p>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Signatory Name</label>
                            <input
                                type="text"
                                value={signatoryName}
                                onChange={(e) => setSignatoryName(e.target.value)}
                                placeholder="e.g. John Smith"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Signatory Title</label>
                            <input
                                type="text"
                                value={signatoryTitle}
                                onChange={(e) => setSignatoryTitle(e.target.value)}
                                placeholder="e.g. Shipping Manager"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Signatory Place</label>
                            <input
                                type="text"
                                value={signatoryPlace}
                                onChange={(e) => setSignatoryPlace(e.target.value)}
                                placeholder="e.g. New York, NY"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone (24hr)</label>
                            <input
                                type="text"
                                value={emergencyPhone}
                                onChange={(e) => setEmergencyPhone(e.target.value)}
                                placeholder="e.g. +1 800-555-0199"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Offeror Name</label>
                            <input
                                type="text"
                                value={offerorName}
                                onChange={(e) => setOfferorName(e.target.value)}
                                placeholder="e.g. ABC Logistics Inc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleSave}
                        className={clsx(
                            "px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2",
                            status === 'saved'
                                ? "bg-green-600 text-white"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                    >
                        {status === 'saved' ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </button>
                    {apiKey && (
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 text-red-600 bg-red-50 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {!apiKey && (
                <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-md border border-amber-100">
                    <AlertCircle className="w-4 h-4" />
                    <span>API Key is required for AI validation features.</span>
                </div>
            )}
        </div>
    );
}

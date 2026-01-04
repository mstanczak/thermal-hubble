import { useState, useEffect } from 'react';
import { StorageManager, type LocalDocument } from '../lib/storage';
import { extractTextFromPdf } from '../lib/gemini';
import { Key, Eye, EyeOff, Trash2, CheckCircle, AlertCircle, Server, Plus, ChevronDown, ChevronUp, RefreshCw, Info, FileText, Upload } from 'lucide-react';
import type { MCPServerConfig } from '../lib/mcp';
import { MCPClientManager } from '../lib/mcp';
import clsx from 'clsx';

export function SettingsPanel() {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');
    const [suggestionModel, setSuggestionModel] = useState('gemini-3-flash-preview');
    const [validationModel, setValidationModel] = useState('gemini-2.5-flash');
    const [screenshotModel, setScreenshotModel] = useState('gemini-3-flash-preview');
    const [ocrModel, setOcrModel] = useState('gemini-3-flash-preview');
    const [signatoryName, setSignatoryName] = useState('');
    const [signatoryTitle, setSignatoryTitle] = useState('');
    const [signatoryPlace, setSignatoryPlace] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [offerorName, setOfferorName] = useState('');

    // Validation Rules State
    const [ruleEmergencyContact, setRuleEmergencyContact] = useState(false);
    const [rulePhysicalLabels, setRulePhysicalLabels] = useState(false);

    const MODELS = [
        { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', description: 'Fastest reasoning. Best for speed.' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Newest fast model. Best for suggestions.' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and cost-effective. Good for general tasks.' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High performance. Best for complex reasoning.' },
        { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash Thinking', description: 'Enhanced reasoning capabilities.' },
        { id: 'models/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', description: 'Latest experimental model.' },
    ];

    const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>([]);
    const [newMcpUrl, setNewMcpUrl] = useState('');
    const [newMcpName, setNewMcpName] = useState('');

    // Track which URL is currently being tested
    const [testingUrl, setTestingUrl] = useState<string | null>(null);
    const [mcpTestResult, setMcpTestResult] = useState<{ url: string; success: boolean; msg: string } | null>(null);
    const [showMcpHelp, setShowMcpHelp] = useState(false);

    // Document State
    const [documents, setDocuments] = useState<LocalDocument[]>([]);
    const [isUploading, setIsUploading] = useState(false);

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

        const storedScreenshotModel = localStorage.getItem('gemini_model_screenshot');
        setScreenshotModel(storedScreenshotModel || 'gemini-3-flash-preview');

        const storedOcrModel = localStorage.getItem('gemini_model_ocr');
        setOcrModel(storedOcrModel || 'gemini-3-flash-preview');

        // Load MCP servers
        const storedMcpServers = localStorage.getItem('mcp_servers');
        if (storedMcpServers) {
            setMcpServers(JSON.parse(storedMcpServers));
        }

        // Load Documents
        StorageManager.getAllDocuments().then(setDocuments);

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

        // Load Validation Rules
        const storedRuleEmergency = localStorage.getItem('rule_emergency_contact');
        if (storedRuleEmergency !== null) {
            setRuleEmergencyContact(storedRuleEmergency === 'true');
        }

        const storedRuleLabels = localStorage.getItem('rule_physical_labels');
        if (storedRuleLabels !== null) {
            setRulePhysicalLabels(storedRuleLabels === 'true');
        }
    }, []);

    const addMcpServer = () => {
        if (!newMcpName || !newMcpUrl) return;
        const newServer: MCPServerConfig = { name: newMcpName, url: newMcpUrl, enabled: true, weight: 100 };
        const updated = [...mcpServers, newServer];
        setMcpServers(updated);
        setNewMcpName('');
        setNewMcpUrl('');
        setMcpTestResult(null); // Clear previous test result
    };

    const removeMcpServer = (index: number) => {
        const updated = mcpServers.filter((_, i) => i !== index);
        setMcpServers(updated);
    };

    const toggleMcpServer = (index: number) => {
        const updated = [...mcpServers];
        updated[index].enabled = !updated[index].enabled;
        setMcpServers(updated);
    };

    const testMcpConnection = async (url: string) => {
        setTestingUrl(url);
        setMcpTestResult(null);
        try {
            const manager = MCPClientManager.getInstance();
            await manager.connectToServer(url);
            setMcpTestResult({ url, success: true, msg: "Connected successfully!" });
        } catch (err: any) {
            setMcpTestResult({
                url,
                success: false,
                msg: err.message || "Connection failed. Ensure server supports SSE."
            });
        } finally {
            setTestingUrl(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const text = await extractTextFromPdf(file);
            const newDoc: LocalDocument = {
                id: crypto.randomUUID(),
                name: file.name,
                content: text,
                weight: 100,
                type: 'pdf',
                timestamp: Date.now()
            };
            await StorageManager.saveDocument(newDoc);
            setDocuments(await StorageManager.getAllDocuments());
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to process document.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDocument = async (id: string) => {
        await StorageManager.deleteDocument(id);
        setDocuments(await StorageManager.getAllDocuments());
    };

    const handleDocumentWeightChange = async (id: string, weight: number) => {
        const doc = documents.find(d => d.id === id);
        if (doc) {
            const updated = { ...doc, weight };
            await StorageManager.saveDocument(updated);
            setDocuments(await StorageManager.getAllDocuments());
        }
    };

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
            localStorage.setItem('gemini_model_suggestions', suggestionModel);
            localStorage.setItem('gemini_model_validation', validationModel);
            localStorage.setItem('gemini_model_screenshot', screenshotModel);
            localStorage.setItem('gemini_model_ocr', ocrModel);

            localStorage.setItem('mcp_servers', JSON.stringify(mcpServers));

            // Keep legacy key updated for safety/compatibility during migration
            localStorage.setItem('gemini_model', suggestionModel);

            localStorage.setItem('default_signatory_name', signatoryName.trim());
            localStorage.setItem('default_signatory_title', signatoryTitle.trim());
            localStorage.setItem('default_signatory_place', signatoryPlace.trim());
            localStorage.setItem('default_emergency_phone', emergencyPhone.trim());
            localStorage.setItem('default_offeror_name', offerorName.trim());

            // Save Validation Rules
            localStorage.setItem('rule_emergency_contact', String(ruleEmergencyContact));
            localStorage.setItem('rule_physical_labels', String(rulePhysicalLabels));

            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleClear = () => {
        localStorage.removeItem('gemini_api_key');
        localStorage.removeItem('gemini_model');
        localStorage.removeItem('gemini_model_suggestions');
        localStorage.removeItem('gemini_model_validation');
        localStorage.removeItem('gemini_model_screenshot');
        localStorage.removeItem('gemini_model_ocr');

        localStorage.removeItem('default_signatory_name');
        localStorage.removeItem('default_signatory_title');
        localStorage.removeItem('default_signatory_place');
        localStorage.removeItem('default_emergency_phone');
        localStorage.removeItem('default_offeror_name');
        localStorage.removeItem('rule_emergency_contact');
        localStorage.removeItem('rule_physical_labels');
        setApiKey('');
        setSuggestionModel('gemini-3-flash-preview');
        setValidationModel('gemini-2.5-flash');
        setScreenshotModel('gemini-3-flash-preview');
        setOcrModel('gemini-3-flash-preview');
        setSignatoryName('');
        setSignatoryTitle('');
        setSignatoryPlace('');
        setEmergencyPhone('');
        setOfferorName('');
        setRuleEmergencyContact(false);
        setRulePhysicalLabels(false);
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
                                id="onboarding-api-key-input"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Screenshot Model</label>
                        <select
                            value={screenshotModel}
                            onChange={(e) => setScreenshotModel(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            {MODELS.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">For DG form screenshot analysis</p>
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



                {/* Default Validation Rules */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        Default Validation Checks
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Enable or disable specific checks that the AI should perform on every shipment.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <p className="font-medium text-gray-900">Require 24-Hour Emergency Response Number</p>
                                <p className="text-xs text-gray-500">Ensure a valid emergency contact number is present on the document.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ruleEmergencyContact}
                                    onChange={(e) => setRuleEmergencyContact(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <p className="font-medium text-gray-900">Check for Physical Labels</p>
                                <p className="text-xs text-gray-500">Verify presence of Orientation Arrows, Cargo Aircraft Only, and Hazard Class diamonds (if image context allows).</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rulePhysicalLabels}
                                    onChange={(e) => setRulePhysicalLabels(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-purple-600" />
                        External Resources (MCP)
                    </h3>

                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setShowMcpHelp(!showMcpHelp)}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
                        >
                            {showMcpHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            How & Why use MCP?
                        </button>

                        {showMcpHelp && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 mb-4 animate-in slide-in-from-top-2">
                                <p className="mb-2 font-semibold">Connect your internal knowledge base to the AI.</p>
                                <p className="mb-3">The Model Context Protocol (MCP) allows this app to securely access external data sources via SSE (Server-Sent Events) to improve validation accuracy.</p>

                                <h4 className="font-bold mb-1 mt-3">Examples:</h4>
                                <ul className="list-disc list-inside space-y-1 ml-1">
                                    <li><strong>FedEx Variations:</strong> Connect a server that scrapes real-time FX-08 operator variations so the AI knows the latest rules.</li>
                                    <li><strong>Internal Database:</strong> Connect to your company's product database to validate part numbers against internal specs.</li>
                                    <li><strong>Private Docs:</strong> Provide access to proprietary SOPs that the public AI model doesn't know about.</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2 mb-4">
                            <input
                                placeholder="Server Name (e.g. Internal DB)"
                                value={newMcpName}
                                onChange={(e) => setNewMcpName(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                                placeholder="SSE URL (e.g. http://localhost:3000/sse)"
                                value={newMcpUrl}
                                onChange={(e) => setNewMcpUrl(e.target.value)}
                                className="flex-[2] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                                onClick={() => testMcpConnection(newMcpUrl)}
                                disabled={!newMcpUrl || testingUrl === newMcpUrl}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                title="Test before adding"
                            >
                                <RefreshCw className={clsx("w-5 h-5", testingUrl === newMcpUrl && "animate-spin")} />
                            </button>
                            <button
                                onClick={addMcpServer}
                                disabled={!newMcpName || !newMcpUrl}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Test result for the "New Server" input specifically */}
                    {mcpTestResult && mcpTestResult.url === newMcpUrl && !mcpServers.find(s => s.url === newMcpUrl) && (
                        <div className={clsx("mb-4 text-sm p-3 rounded-lg flex items-center gap-2", mcpTestResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                            {mcpTestResult.success ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                            {mcpTestResult.msg}
                        </div>
                    )}

                    <div className="space-y-3">
                        {mcpServers.map((server, idx) => (
                            <div key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <input
                                            type="checkbox"
                                            checked={server.enabled}
                                            onChange={() => toggleMcpServer(idx)}
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm text-gray-900 truncate">{server.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{server.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => testMcpConnection(server.url)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Test Connection"
                                            disabled={testingUrl === server.url}
                                        >
                                            <RefreshCw className={clsx("w-4 h-4", testingUrl === server.url && "animate-spin")} />
                                        </button>
                                        <button
                                            onClick={() => removeMcpServer(idx)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Remove Server"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {/* Per-server test result */}
                                {mcpTestResult && mcpTestResult.url === server.url && (
                                    <div className={clsx("text-xs p-2 rounded flex items-center gap-2", mcpTestResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                                        {mcpTestResult.success ? <CheckCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                        {mcpTestResult.msg}
                                    </div>
                                )}
                            </div>
                        ))}
                        {mcpServers.length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                                No external resources configured.
                            </div>
                        )}
                    </div>
                </div>

                {/* Local Documents */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Local Documents (Context)
                    </h3>

                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-3">Upload PDF guides (e.g., FedEx FX-18, IATA extracts) to be used as context during validation.</p>

                        <div className="flex items-center gap-4">
                            <label className={clsx(
                                "flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-200",
                                isUploading && "opacity-50 cursor-not-allowed"
                            )}>
                                <Upload className="w-4 h-4" />
                                {isUploading ? 'Processing...' : 'Upload PDF'}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="application/pdf"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{(doc.content.length / 1024).toFixed(1)} KB extracted</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-medium text-gray-500">Weight:</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={doc.weight}
                                                onChange={(e) => handleDocumentWeightChange(doc.id, parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-right pr-6"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Remove Document"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {documents.length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                                No documents uploaded.
                            </div>
                        )}
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
                        id="onboarding-save-btn"
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

            {
                !apiKey && (
                    <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-md border border-amber-100">
                        <AlertCircle className="w-4 h-4" />
                        <span>API Key is required for AI validation features.</span>
                    </div>
                )
            }

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-center">
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to reset the application? This will clear all data and settings.')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                    title="Clear all saved data (keys, models, settings) and reload the application. Use this if the app becomes unresponsive."
                >
                    Reset Application
                </button>
            </div>
        </div >
    );
}

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Check, AlertTriangle, XCircle, Camera, Info } from 'lucide-react';
import { validateDGScreenShotWithGemini, type ValidationResult, calculateCostDetails } from '../lib/gemini';
import { ValidationIntelligence } from './ValidationResult';
import clsx from 'clsx';

export function DGValidator() {
    const MODELS_FOR_COMPARISON = [
        { id: 'gemini-1.5-flash', name: '1.5 Flash' },
        { id: 'gemini-2.0-flash', name: '2.0 Flash' },
        { id: 'gemini-1.5-pro', name: '1.5 Pro' }
    ];

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPasteActive, setIsPasteActive] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const pasteTargetRef = useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    const enablePasteMode = () => {
        setIsPasteActive(true);
        // Use setTimeout to ensure the DOM has rendered the focusable element
        setTimeout(() => {
            pasteTargetRef.current?.focus();
        }, 100);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile();
                if (blob) processFile(blob);
                break;
            }
        }
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (screenshot).');
            return;
        }

        setFile(file);
        setError(null);
        setStatus('analyzing');
        setResult(null);

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            const modelId = localStorage.getItem('gemini_model_screenshot') || 'gemini-3-flash-preview';

            if (!apiKey) {
                throw new Error("API Key is missing. Please configure it in settings.");
            }

            const validationResult = await validateDGScreenShotWithGemini(file, apiKey, modelId);
            setResult(validationResult);
            setStatus('complete');
        } catch (err: any) {
            setError(err.message || "Unknown error occurred");
            setStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    DG Form Validator
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    Upload a screenshot of your shipping software's Dangerous Goods tab (e.g., Piyovi, FedEx Ship Manager) to validate compliance.
                </p>

                <div className="flex flex-wrap gap-2 justify-end mb-4">
                    <button
                        type="button"
                        onClick={enablePasteMode}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                    >
                        <Check className="w-4 h-4" />
                        <span>Paste Screenshot</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                    </button>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] outline-none",
                        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
                        file && status === 'complete' ? "bg-green-50 border-green-200" : ""
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {status === 'analyzing' ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-sm font-medium text-blue-700">Analyzing Screenshot...</p>
                            <p className="text-xs text-gray-500">Checking against regulations...</p>
                        </div>
                    ) : status === 'complete' && result ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className={clsx(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                                result.status === 'Pass' ? "bg-green-100 text-green-600" :
                                    result.status === 'Fail' ? "bg-red-100 text-red-600" :
                                        "bg-amber-100 text-amber-600"
                            )}>
                                {result.status === 'Pass' ? <Check className="w-6 h-6" /> :
                                    result.status === 'Fail' ? <XCircle className="w-6 h-6" /> :
                                        <AlertTriangle className="w-6 h-6" />}
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                                {result.status === 'Warnings' ? 'Passed with Warnings' : `Validation ${result.status}`}
                            </p>
                            <p className="text-sm text-gray-600">{file?.name}</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); setResult(null); }}
                                className="text-sm text-blue-600 hover:underline mt-2"
                            >
                                Upload Another
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 text-gray-400 mb-4" />
                            <p className="text-base font-medium text-gray-700">Click to upload or drag & drop</p>
                            <p className="text-sm text-gray-500 mt-1">Supports screenshots and images</p>
                        </>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
            </div>

            {/* Results Display */}
            {result && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className={clsx(
                        "p-4 border-b flex justify-between items-center rounded-t-xl",
                        result.status === 'Pass' ? "bg-green-50 border-green-100" :
                            result.status === 'Fail' ? "bg-red-50 border-red-100" :
                                "bg-amber-50 border-amber-100"
                    )}>
                        <h4 className={clsx(
                            "font-semibold flex items-center gap-2",
                            result.status === 'Pass' ? "text-green-800" :
                                result.status === 'Fail' ? "text-red-800" :
                                    "text-amber-800"
                        )}>
                            {result.status === 'Pass' ? <Check className="w-5 h-5" /> :
                                result.status === 'Fail' ? <XCircle className="w-5 h-5" /> :
                                    <AlertTriangle className="w-5 h-5" />}
                            Analysis Report
                        </h4>

                        {result.usage && (
                            <div className="group relative flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-2 bg-white/60 px-2 py-1 rounded-md text-gray-800 border border-black/5 font-semibold font-mono cursor-help">
                                    <span className="text-gray-400">$</span>
                                    {result.usage.estimatedCost.toFixed(5)}
                                    <Info className="w-3 h-3 text-gray-400" />
                                </div>

                                {/* Hover Tooltip Card */}
                                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                    <h5 className="font-bold text-gray-900 mb-2 border-b pb-1">Cost Breakdown</h5>

                                    <div className="space-y-1 mb-3">
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>Model:</span>
                                            <span className="font-medium text-blue-600">{result.usage.modelId}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span>Input ({result.usage.promptTokens})</span>
                                            <span>${result.usage.inputCost.toFixed(5)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span>Output ({result.usage.candidatesTokens})</span>
                                            <span>${result.usage.outputCost.toFixed(5)}</span>
                                        </div>
                                    </div>

                                    <h5 className="font-bold text-gray-900 mb-2 border-b pb-1">Price Comparison</h5>
                                    <div className="space-y-1 text-[11px]">
                                        {MODELS_FOR_COMPARISON.map(m => {
                                            const comparison = calculateCostDetails(m.id, result.usage!.promptTokens, result.usage!.candidatesTokens);
                                            const isCurrent = result.usage!.modelId.includes(m.id);
                                            return (
                                                <div key={m.id} className={clsx("flex justify-between", isCurrent && "text-blue-600 font-bold")}>
                                                    <span>{m.name} {isCurrent && "(current)"}</span>
                                                    <span>
                                                        ${comparison.totalCost.toFixed(5)}{" "}
                                                        <span className="text-[9px] text-gray-400 font-normal">
                                                            (${comparison.inputCost.toFixed(5)} + ${comparison.outputCost.toFixed(5)})
                                                        </span>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="absolute w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45 -bottom-1.5 right-6"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        {result.issues.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="text-lg font-medium text-gray-900">No Issues Found</p>
                                <p>The shipment appears to be compliant with regulations.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {result.issues.map((issue, idx) => (
                                    <div key={idx} className={clsx(
                                        "p-4 rounded-lg border",
                                        issue.severity === 'Critical' ? "bg-red-50 border-red-200" :
                                            issue.severity === 'Warning' ? "bg-amber-50 border-amber-200" :
                                                "bg-blue-50 border-blue-200"
                                    )}>
                                        <div className="flex items-start gap-3">
                                            {issue.severity === 'Critical' ? <XCircle className="w-5 h-5 text-red-600 mt-0.5" /> :
                                                issue.severity === 'Warning' ? <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" /> :
                                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />}

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={clsx(
                                                        "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                                        issue.severity === 'Critical' ? "bg-red-200 text-red-800" :
                                                            issue.severity === 'Warning' ? "bg-amber-200 text-amber-800" :
                                                                "bg-blue-200 text-blue-800"
                                                    )}>
                                                        {issue.severity}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Confidence: {issue.confidence}%</span>
                                                </div>
                                                <p className="font-medium text-gray-900 mb-1">{issue.description}</p>
                                                <p className="text-sm text-gray-700 mb-2">{issue.explanation}</p>

                                                {issue.recommendation && (
                                                    <div className="text-sm bg-white bg-opacity-60 p-2 rounded border border-gray-200/50">
                                                        <span className="font-semibold text-gray-700">Recommendation: </span>
                                                        {issue.recommendation}
                                                    </div>
                                                )}

                                                {issue.regulationReference && (
                                                    <p className="text-xs text-gray-500 mt-2">Ref: {issue.regulationReference}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Intelligence Footer */}
                        {result.metadata && <ValidationIntelligence metadata={result.metadata} issues={result.issues} />}
                    </div>
                </div>
            )}
            {isPasteActive && (
                <div
                    ref={pasteTargetRef}
                    onPaste={(e) => {
                        handlePaste(e);
                        setIsPasteActive(false);
                    }}
                    onBlur={() => setIsPasteActive(false)}
                    tabIndex={0}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/90 backdrop-blur-sm transition-all outline-none"
                    onClick={() => setIsPasteActive(false)}
                >
                    <div className="text-center text-white p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-6 animate-bounce">
                            <Check className="w-20 h-20 mx-auto" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Ready to Paste!</h2>
                        <p className="text-blue-100 text-lg mb-8">Press <kbd className="bg-white/20 px-2 py-1 rounded">Ctrl+V</kbd> or <kbd className="bg-white/20 px-2 py-1 rounded">⌘+V</kbd> now</p>
                        <button
                            onClick={() => setIsPasteActive(false)}
                            className="text-sm text-blue-200 hover:text-white underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

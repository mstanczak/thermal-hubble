import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Calculator, Check, ShieldCheck } from 'lucide-react';
import { parseSDSWithGemini } from '../lib/gemini';
import type { HazmatFormData } from '../lib/validation';

import clsx from 'clsx';

interface SDSUploadProps {
    onDataParsed: (data: Partial<HazmatFormData>, confidence?: Record<string, number>) => void;
    onQuantityCalculated: (quantity: number, unit: string) => void;
}

export function SDSUpload({ onDataParsed, onQuantityCalculated }: SDSUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'ocr' | 'parsing' | 'complete' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isStuck, setIsStuck] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<number | null>(null);

    // Calculator State
    const [unitCount, setUnitCount] = useState<string>('');
    const [unitSize, setUnitSize] = useState<string>('');
    const [unitType, setUnitType] = useState<string>('L');

    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationSuccess, setCalculationSuccess] = useState(false);
    const [validationWarning, setValidationWarning] = useState<string | null>(null);

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

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            setError('Please upload an image or PDF file.');
            return;
        }

        setFile(file);
        setError(null);
        setIsStuck(false);
        setStatus('ocr');
        setStatusMessage("Initializing...");

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            const modelId = localStorage.getItem('gemini_model_ocr') || 'gemini-2.5-flash';

            if (!apiKey) {
                throw new Error("API Key is missing. Please configure it in settings.");
            }

            const data = await parseSDSWithGemini(file, apiKey, modelId, (msg) => {
                setStatusMessage(msg);
                if (msg.includes("OCR")) {
                    setStatus('ocr');
                    setIsStuck(false);
                }
                if (msg.includes("Extracting")) {
                    setStatus('parsing');
                    setIsStuck(false);

                    // Set a timeout for the AI extraction phase (30 seconds)
                    timeoutRef.current = window.setTimeout(() => {
                        setIsStuck(true);
                    }, 30000);
                }
            });

            // Clear timeout on success
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            onDataParsed(data, data.confidence);
            setStatus('complete');
            setIsStuck(false);
        } catch (err: any) {
            // Clear timeout on error
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            const phase = status === 'ocr' ? 'OCR (text extraction)' : 'AI data extraction';
            setError(`Failed during ${phase}: ${err.message || "Unknown error"}`);
            setFile(null);
            setStatus('error');
            setIsStuck(false);
        }
    };

    const normalizeUnit = (qty: number, unit: string): { qty: number, unit: string } => {
        if (unit === 'ml') return { qty: qty / 1000, unit: 'L' };
        if (unit === 'g') return { qty: qty / 1000, unit: 'kg' };
        return { qty, unit };
    };

    const calculateQuantity = () => {
        setIsCalculating(true);

        let finalTotal = 0;
        let finalUnit = unitType;

        if (unitCount && unitSize) {
            const count = parseFloat(unitCount);
            const size = parseFloat(unitSize);
            if (!isNaN(count) && !isNaN(size)) {
                const rawTotal = count * size;
                const normalized = normalizeUnit(rawTotal, unitType);
                finalTotal = normalized.qty;
                finalUnit = normalized.unit;
            }
        }

        // Validation Check
        if (finalTotal > 30 && (finalUnit === 'kg' || finalUnit === 'L')) {
            setValidationWarning(`Warning: ${finalTotal.toFixed(2)} ${finalUnit} is a large quantity. Verify strictly against Cargo Aircraft Only limits.`);
        } else {
            setValidationWarning(null);
        }

        setTimeout(() => {
            onQuantityCalculated(parseFloat(finalTotal.toFixed(3)), finalUnit);
            setIsCalculating(false);
            setCalculationSuccess(true);
            setTimeout(() => setCalculationSuccess(false), 2000);
        }, 300);
    };


    const Tooltip = ({ text, title }: { text: string, title?: string }) => (
        <div className="group relative inline-block ml-1 align-middle">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 cursor-help inline" />
            <div className="invisible group-hover:visible absolute z-20 w-72 p-3 mt-1 text-xs text-white bg-gray-900 rounded-lg shadow-xl -left-2 top-full border border-gray-700 leading-relaxed">
                {title && <div className="font-bold border-b border-gray-700 pb-1 mb-1 text-blue-300">{title}</div>}
                {text}
                <div className="absolute w-2 h-2 bg-gray-900 border-t border-l border-gray-700 transform rotate-45 -top-1.5 left-3"></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Auto-fill from SDS / Document
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div>
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all h-full flex flex-col items-center justify-center",
                            isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-gray-50",
                            file ? "bg-green-50 border-green-200" : ""
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {status === 'ocr' || status === 'parsing' ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                <p className="text-sm font-medium text-purple-700">{statusMessage}</p>
                                <p className="text-xs text-gray-500">
                                    {status === 'ocr' ? "Reading document text..." : "Interpreting shipping data..."}
                                </p>
                                {isStuck && status === 'parsing' && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-xs text-yellow-700 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            AI analysis is taking longer than usual. Still processing...
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : status === 'complete' && file ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <Check className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-green-800">{file.name}</p>
                                <p className="text-xs text-green-600">Analysis Complete</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
                                    className="text-xs text-red-500 hover:underline mt-2"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-700">Click or drag SDS here</p>
                                <p className="text-xs text-gray-500 mt-1">Supports PDF & Images</p>
                            </>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>

                {/* Quantity Calculator */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-gray-600" />
                        Quantity Calculator
                    </h4>

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Unit Count
                                    <Tooltip text="Number of individual containers or units (e.g., 10 bottles)." />
                                </label>
                                <input
                                    type="number"
                                    value={unitCount}
                                    onChange={(e) => setUnitCount(e.target.value)}
                                    placeholder="e.g. 10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Unit Size
                                    <Tooltip text="Size or volume of each individual unit (e.g., 0.5 for half-liter bottles)." />
                                </label>
                                <input
                                    type="number"
                                    value={unitSize}
                                    onChange={(e) => setUnitSize(e.target.value)}
                                    placeholder="e.g. 0.5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                                Unit Type
                            </label>
                            <select
                                value={unitType}
                                onChange={(e) => setUnitType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option value="L">L (Liters)</option>
                                <option value="ml">ml (Milliliters)</option>
                                <option value="kg">kg (Kilograms)</option>
                                <option value="g">g (Grams)</option>
                                <option value="lbs">lbs (Pounds)</option>
                                <option value="oz">oz (Ounces)</option>
                            </select>
                        </div>

                        {/* Live Calculation Preview */}
                        {(unitCount && unitSize) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total Net Quantity:</span>
                                <span className="font-bold text-gray-900 text-sm">
                                    {(() => {
                                        const count = parseFloat(unitCount);
                                        const size = parseFloat(unitSize);
                                        if (isNaN(count) || isNaN(size)) return '---';
                                        const raw = count * size;
                                        const { qty, unit } = normalizeUnit(raw, unitType);
                                        return `${qty.toFixed(3)} ${unit}`;
                                    })()}
                                </span>
                            </div>
                        )}

                        {validationWarning && (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span>{validationWarning}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={calculateQuantity}
                            disabled={!unitCount || !unitSize || isCalculating || calculationSuccess}
                            className={clsx(
                                "w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                                calculationSuccess
                                    ? "bg-green-600 text-white"
                                    : (!unitCount || !unitSize)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-purple-600 text-white hover:bg-purple-700"
                            )}
                        >
                            {isCalculating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </>
                            ) : calculationSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Applied!
                                </>
                            ) : (
                                "Apply to Form"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

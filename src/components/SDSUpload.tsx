import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Calculator, Check, Info } from 'lucide-react';
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
            const modelId = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';

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

    const calculateQuantity = () => {
        const count = parseFloat(unitCount);
        const size = parseFloat(unitSize);

        if (!isNaN(count) && !isNaN(size)) {
            setIsCalculating(true);
            setTimeout(() => {
                const total = count * size;
                onQuantityCalculated(total, unitType);
                setIsCalculating(false);
                setCalculationSuccess(true);
                setTimeout(() => setCalculationSuccess(false), 2000);
            }, 300);
        }
    };

    const Tooltip = ({ text }: { text: string }) => (
        <div className="group relative inline-block ml-1">
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help inline" />
            <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-900 rounded-lg shadow-lg -left-2 top-full">
                {text}
                <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -top-1 left-3"></div>
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Unit Type
                                <Tooltip text="Select the measurement unit (Liters, Kilograms, etc.). The calculator will multiply Unit Count × Unit Size." />
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

                        <button
                            type="button"
                            onClick={calculateQuantity}
                            disabled={isCalculating || calculationSuccess}
                            className={clsx(
                                "w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                                calculationSuccess
                                    ? "bg-green-600 text-white"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                            )}
                        >
                            {isCalculating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Calculating...
                                </>
                            ) : calculationSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Added to Form!
                                </>
                            ) : (
                                <>
                                    <Calculator className="w-4 h-4" />
                                    Calculate Total
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hazmatFormSchema, type HazmatFormData } from '../lib/validation';
import { CARRIERS, MODES, SERVICE_TYPES, COMMON_UN_NUMBERS } from '../data/regulations';
import { HAZARD_CLASSES } from '../data/hazardClasses';
import { PACKING_INSTRUCTIONS } from '../data/packingInstructions';
import { validateShipmentWithGemini, getFieldSuggestions, type ValidationResult, type Suggestion } from '../lib/gemini';
import { ValidationResultCard } from './ValidationResult';
import { CheckCircle, Plane, Truck, Loader2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { SDSUpload } from './SDSUpload';
import { ApiKeyModal } from './ApiKeyModal';
interface HazmatFormProps {
    isSubmitDisabled?: boolean;
}

export function HazmatForm({ isSubmitDisabled = false }: HazmatFormProps) {
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);

    // Suggestion State
    const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<HazmatFormData>({
        resolver: zodResolver(hazmatFormSchema),
        defaultValues: {
            carrier: 'FedEx',
            mode: 'Air',
            weightUnit: 'kg',
            quantityUnit: 'kg',
            reportableQuantity: false,
            cargoAircraftOnly: false,
        },
    });

    const handleSDSData = (data: Partial<HazmatFormData>, confidence?: Record<string, number>) => {
        if (data.unNumber) setValue('unNumber', data.unNumber);
        if (data.properShippingName) setValue('properShippingName', data.properShippingName);
        if (data.hazardClass) setValue('hazardClass', data.hazardClass as any);
        if (data.packingGroup) setValue('packingGroup', data.packingGroup as any);
        if (data.technicalName) setValue('technicalName', data.technicalName);
        if (data.packingInstruction) setValue('packingInstruction', data.packingInstruction);
        if (data.packagingType) setValue('packagingType', data.packagingType);

        if (confidence) {
            setConfidenceScores(confidence);
        }
    };

    const handleQuantityCalculated = (quantity: number, unit: string) => {
        setValue('quantity', quantity);
        setValue('quantityUnit', unit);
    };

    const selectedCarrier = watch('carrier');
    const selectedMode = watch('mode');
    const selectedUn = watch('unNumber');

    // Filter services based on carrier and mode
    const availableServices = SERVICE_TYPES.filter(
        (s) => s.carrier === selectedCarrier && s.mode === selectedMode
    );

    const selectedProperShippingName = watch('properShippingName');
    const isTechnicalNameRequired = selectedProperShippingName?.toLowerCase().includes('n.o.s.') || false;

    // Auto-fill proper shipping name when UN number is selected
    useEffect(() => {
        const match = COMMON_UN_NUMBERS.find((item) => item.un === selectedUn);
        if (match) {
            setValue('properShippingName', match.name);
        }
    }, [selectedUn, setValue]);

    // Clear technical name if not required
    useEffect(() => {
        if (!isTechnicalNameRequired) {
            setValue('technicalName', '');
        }
    }, [isTechnicalNameRequired, setValue]);

    // Load default signatory values when Air mode is selected
    useEffect(() => {
        if (selectedMode === 'Air') {
            const defaultName = localStorage.getItem('default_signatory_name');
            const defaultTitle = localStorage.getItem('default_signatory_title');
            const defaultPlace = localStorage.getItem('default_signatory_place');

            if (defaultName && !watch('signatoryName')) {
                setValue('signatoryName', defaultName);
            }
            if (defaultTitle && !watch('signatoryTitle')) {
                setValue('signatoryTitle', defaultTitle);
            }
            if (defaultPlace && !watch('signatoryPlace')) {
                setValue('signatoryPlace', defaultPlace);
            }
        }
    }, [selectedMode, setValue, watch]);

    // Load default offeror name when Ground mode is selected
    useEffect(() => {
        if (selectedMode === 'Ground') {
            const defaultOfferor = localStorage.getItem('default_offeror_name');
            if (defaultOfferor && !watch('offerorName')) {
                setValue('offerorName', defaultOfferor);
            }
        }
    }, [selectedMode, setValue, watch]);

    // Load default emergency phone on mount
    useEffect(() => {
        const defaultPhone = localStorage.getItem('default_emergency_phone');
        if (defaultPhone && !watch('emergencyPhone')) {
            setValue('emergencyPhone', defaultPhone);
        }
    }, [setValue, watch]);

    // Reset confidence score when user manually modifies a field
    useEffect(() => {
        const subscription = watch((_value, { name, type }) => {
            if (name && type === 'change') {
                setConfidenceScores(prev => {
                    if (prev[name] !== undefined) {
                        const newScores = { ...prev };
                        delete newScores[name];
                        return newScores;
                    }
                    return prev;
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const onSubmit = async (data: HazmatFormData) => {
        setApiError(null);
        setValidationResult(null);
        setIsLoading(true);

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            const modelId = localStorage.getItem('gemini_model_validation') || 'gemini-2.5-flash';

            if (!apiKey) {
                setShowApiKeyModal(true);
                setIsLoading(false);
                return;
            }

            const result = await validateShipmentWithGemini(data, apiKey, modelId);
            setValidationResult(result);
        } catch (error: any) {
            setApiError(error.message || "Failed to validate shipment. Please check your API key and try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetSuggestions = async (fieldName: string) => {
        setActiveSuggestionField(fieldName);
        setIsSuggesting(true);
        setSuggestions([]);

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            const modelId = localStorage.getItem('gemini_model_suggestions') || 'gemini-2.5-flash';

            if (!apiKey) {
                setShowApiKeyModal(true);
                setActiveSuggestionField(null);
                return;
            }

            const currentData = watch();
            const results = await getFieldSuggestions(currentData, fieldName, apiKey, modelId);
            setSuggestions(results);
        } catch (error) {
            console.error("Failed to get suggestions", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const applySuggestion = (fieldName: string, value: string) => {
        setValue(fieldName as any, value);
        setActiveSuggestionField(null);
        setSuggestions([]);
        // Optimistically update confidence to 100 (user selected it)
        setConfidenceScores(prev => ({ ...prev, [fieldName]: 100 }));
    };

    const renderConfidenceBadge = (fieldName: string) => {
        const score = confidenceScores[fieldName];
        const showSuggestionBtn = score === undefined || score < 80;

        return (
            <div className="inline-flex items-center ml-2 relative">
                {score !== undefined && (
                    <span className={clsx(
                        "text-xs px-2 py-0.5 rounded-full font-medium mr-1",
                        score >= 80 ? "bg-green-100 text-green-700" :
                            score >= 50 ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                    )} title={`AI Confidence: ${score}%`}>
                        {score}%
                    </span>
                )}

                {showSuggestionBtn && (
                    <button
                        type="button"
                        onClick={() => handleGetSuggestions(fieldName)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Get AI Suggestions"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Suggestion Popup */}
                {activeSuggestionField === fieldName && (
                    <div className="absolute z-50 left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Suggestions
                            </span>
                            <button
                                onClick={() => setActiveSuggestionField(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="p-1 max-h-64 overflow-y-auto">
                            {isSuggesting ? (
                                <div className="flex items-center justify-center py-4 text-gray-500 gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">Thinking...</span>
                                </div>
                            ) : suggestions.length > 0 ? (
                                <div className="space-y-1">
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => applySuggestion(fieldName, s.value)}
                                            className="w-full text-left p-2 hover:bg-gray-50 rounded-lg group transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-sm text-gray-900">{s.value}</span>
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                                    {s.confidence}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 group-hover:text-gray-700">
                                                {s.reasoning}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-center text-xs text-gray-500">
                                    No suggestions found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
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
        <div className="space-y-8">
            <SDSUpload
                onDataParsed={handleSDSData}
                onQuantityCalculated={handleQuantityCalculated}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Carrier & Service */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                        Shipment Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Carrier
                                <Tooltip text="Select the shipping carrier (FedEx or UPS) that will transport this hazardous material." />
                            </label>
                            <select
                                {...register('carrier')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {CARRIERS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transport Mode
                                <Tooltip text="Choose Air for air freight (IATA regulations) or Ground for truck transport (DOT regulations). This determines which compliance rules apply." />
                            </label>
                            <div className="flex gap-4">
                                {MODES.map((m) => (
                                    <label key={m} className={clsx(
                                        "flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-all",
                                        selectedMode === m
                                            ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                                            : "border-gray-200 hover:bg-gray-50"
                                    )}>
                                        <input
                                            type="radio"
                                            value={m}
                                            {...register('mode')}
                                            className="sr-only"
                                        />
                                        {m === 'Air' ? <Plane className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                        {m}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Type
                                <Tooltip text="Select the specific shipping service (e.g., FedEx Priority Overnight, UPS Ground). Available options depend on carrier and mode." />
                            </label>
                            <select
                                {...register('service')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Service</option>
                                {availableServices.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service.message}</p>}
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight
                                    <Tooltip text="Total gross weight of the package including packaging materials." />
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    {...register('weight', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
                            </div>
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select
                                    {...register('weightUnit')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Dangerous Goods Data */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                        Dangerous Goods Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                UN Number
                                <Tooltip text="Four-digit United Nations identification number for the hazardous material (e.g., UN1263). This is the primary classification code." />
                                {renderConfidenceBadge('unNumber')}
                            </label>
                            <input
                                list="un-numbers"
                                {...register('unNumber')}
                                placeholder="UN1234"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            />
                            <datalist id="un-numbers">
                                {COMMON_UN_NUMBERS.map((item) => (
                                    <option key={item.un} value={item.un}>{item.name}</option>
                                ))}
                            </datalist>
                            {errors.unNumber && <p className="text-red-500 text-xs mt-1">{errors.unNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proper Shipping Name
                                <Tooltip text="Official name used to identify the hazardous material in shipping documents. Must match the UN number classification." />
                                {renderConfidenceBadge('properShippingName')}
                            </label>
                            <input
                                {...register('properShippingName')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.properShippingName && <p className="text-red-500 text-xs mt-1">{errors.properShippingName.message}</p>}
                        </div>

                        <div>
                            <label className={clsx("block text-sm font-medium mb-1", isTechnicalNameRequired ? "text-gray-700" : "text-gray-400")}>
                                Technical Name (if n.o.s.)
                                <Tooltip text="Required when the proper shipping name includes 'n.o.s.' (not otherwise specified). Provide the chemical or technical name of the hazardous component." />
                                {renderConfidenceBadge('technicalName')}
                            </label>
                            <input
                                {...register('technicalName')}
                                disabled={!isTechnicalNameRequired}
                                placeholder={isTechnicalNameRequired ? "e.g. Caprylyl Chloride" : "Not required"}
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-lg outline-none transition-colors",
                                    isTechnicalNameRequired
                                        ? "border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                                        : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hazard Class
                                    <Tooltip text="Primary hazard classification (e.g., 3 for flammable liquids, 8 for corrosives). Determines handling and packaging requirements." />
                                    {renderConfidenceBadge('hazardClass')}
                                </label>
                                <select
                                    {...register('hazardClass')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Class</option>
                                    {HAZARD_CLASSES.map((hc) => (
                                        <option key={hc.id} value={hc.id}>{hc.label}</option>
                                    ))}
                                </select>
                                {errors.hazardClass && <p className="text-red-500 text-xs mt-1">{errors.hazardClass.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Packing Group
                                    <Tooltip text="Indicates the degree of danger: I (high), II (medium), or III (low). Not all hazard classes require a packing group." />
                                    {renderConfidenceBadge('packingGroup')}
                                </label>
                                <select
                                    {...register('packingGroup')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">None</option>
                                    <option value="I">I - High Danger</option>
                                    <option value="II">II - Medium Danger</option>
                                    <option value="III">III - Low Danger</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Net Quantity
                                    <Tooltip text="Amount of hazardous material in the package (excluding packaging weight). Use the quantity calculator above for multiple units." />
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('quantity', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                            </div>
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <input
                                    {...register('quantityUnit')}
                                    placeholder="L/kg"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Phone (24hr)
                                <Tooltip text="24-hour emergency contact number for incidents involving this shipment. Must be monitored at all times during transport." />
                            </label>
                            <input
                                {...register('emergencyPhone')}
                                placeholder="+1 800-555-0199"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.emergencyPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyPhone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Packaging Type Description
                                <Tooltip text="Describe the outer packaging (e.g., '1 Fibreboard Box x 4 L' or '2 Steel Drums x 10 kg'). Include quantity and container type." />
                                {renderConfidenceBadge('packagingType')}
                            </label>
                            <input
                                {...register('packagingType')}
                                placeholder="e.g. 1 Fibreboard Box x 4 L"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Describe the outer packaging type and quantity</p>
                        </div>
                    </div>

                    {/* Dynamic Fields based on Mode */}
                    {selectedMode === 'Air' && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Plane className="w-4 h-4 text-blue-600" />
                                Air Shipment Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Packing Instruction
                                        <Tooltip text="IATA packing instruction number (e.g., 355, Y344) that specifies packaging requirements for air transport. Found in the IATA Dangerous Goods Regulations." />
                                        {renderConfidenceBadge('packingInstruction')}
                                    </label>
                                    <input
                                        list="packing-instructions"
                                        {...register('packingInstruction')}
                                        placeholder="e.g. 355, Y344"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <datalist id="packing-instructions">
                                        {PACKING_INSTRUCTIONS.map((pi) => (
                                            <option key={pi.id} value={pi.id}>{pi.description}</option>
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Signatory Name
                                        <Tooltip text="Full name of the person certifying this shipment complies with regulations. This person is legally responsible for the declaration." />
                                    </label>
                                    <input
                                        {...register('signatoryName')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Signatory Title
                                        <Tooltip text="Job title or position of the person signing (e.g., 'Shipping Manager', 'Compliance Officer')." />
                                    </label>
                                    <input
                                        {...register('signatoryTitle')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Signatory Place
                                        <Tooltip text="City and state/country where the declaration is signed (e.g., 'New York, NY')." />
                                    </label>
                                    <input
                                        {...register('signatoryPlace')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        {...register('cargoAircraftOnly')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="text-sm text-gray-700">Cargo Aircraft Only</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMode === 'Ground' && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-blue-600" />
                                Ground Shipment Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Offeror Name
                                        <Tooltip text="Name of the company or individual offering the hazardous material for ground transport. Required for DOT compliance." />
                                    </label>
                                    <input
                                        {...register('offerorName')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        {...register('reportableQuantity')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="text-sm text-gray-700">Reportable Quantity (RQ)</label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || isSubmitDisabled}
                    title={isSubmitDisabled ? "Please accept the compliance banner at the top of the page to continue." : undefined}
                    className={clsx(
                        "w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
                        (isLoading || isSubmitDisabled)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Validating Shipment...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Validate Shipment
                        </>
                    )}
                </button>
            </form>

            {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {apiError}
                </div>
            )}

            {validationResult && (
                <ValidationResultCard result={validationResult} />
            )}

            <ApiKeyModal
                isOpen={showApiKeyModal}
                onClose={() => setShowApiKeyModal(false)}
            />
        </div>
    );
}

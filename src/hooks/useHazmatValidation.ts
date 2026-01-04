import { useState } from 'react';
import type { HazmatFormData } from '../lib/validation';
import { validateShipmentWithGemini, type ValidationResult } from '../lib/gemini';

export function useHazmatValidation() {
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const validateShipment = async (
        data: HazmatFormData,
        setShowApiKeyModal: (show: boolean) => void
    ) => {
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

    return {
        validationResult,
        isLoading,
        apiError,
        validateShipment,
        setValidationResult, // Exposed if needed for resets
        setApiError
    };
}

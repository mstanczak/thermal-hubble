import { useState } from 'react';
import { getFieldSuggestions, type Suggestion } from '../lib/gemini';
import type { HazmatFormData } from '../lib/validation';

export function useAiSuggestions() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);

    const getSuggestions = async (
        formData: HazmatFormData,
        fieldName: string,
        setShowApiKeyModal: (show: boolean) => void
    ) => {
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

            const results = await getFieldSuggestions(formData, fieldName, apiKey, modelId);
            setSuggestions(results);
        } catch (error) {
            console.error("Failed to get suggestions", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const clearSuggestions = () => {
        setActiveSuggestionField(null);
        setSuggestions([]);
    };

    return {
        suggestions,
        isSuggesting,
        activeSuggestionField,
        setActiveSuggestionField,
        getSuggestions,
        clearSuggestions
    };
}

import { ArrowLeft, ShieldCheck, Bot, Scale, Lock, Server, FileText } from 'lucide-react';

interface ComplianceInfoProps {
    onBack: () => void;
}

export function ComplianceInfo({ onBack }: ComplianceInfoProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Validation
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Compliance & Safety</h2>
                    <p className="text-gray-600 mt-1">Understanding how we handle your data and liability.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Section 1: Data Privacy */}
                <section className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900">1. Local-First Data Privacy</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We believe your shipping data belongs to you. That's why Thermal Hubble is built on a
                                    <span className="font-semibold text-blue-700"> "Local-First" architecture</span>.
                                </p>

                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold">
                                            <Lock className="w-4 h-4" />
                                            What stays on your device
                                        </div>
                                        <ul className="text-sm text-blue-800/80 space-y-1 ml-6 list-disc">
                                            <li>Shipment details & addresses</li>
                                            <li>Saved API keys</li>
                                            <li>Custom settings and defaults</li>
                                            <li>History of recent validations</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2 text-gray-700 font-semibold">
                                            <Server className="w-4 h-4" />
                                            What we (don't) see
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            We do not have a backend database for user data. We cannot see, sell, or lose your shipment records because we simply don't have them.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: AI Usage */}
                <section className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                                <Bot className="w-8 h-8" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900">2. Powered by Gemini AI</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    To provide intelligent suggestions and OCR capabilities, we connect directly to Google's Gemini AI.
                                </p>

                                <div className="bg-purple-50/50 p-5 rounded-lg border border-purple-100">
                                    <h4 className="font-semibold text-purple-900 mb-2">How it works:</h4>
                                    <ol className="text-sm text-purple-800 space-y-2 list-decimal ml-4">
                                        <li>Your browser sends the specific text or image you provide directly to Google's API.</li>
                                        <li>The AI processes the data to find hazmat info or validate regulations.</li>
                                        <li>The response is sent back to your browser.</li>
                                        <li><strong>Important:</strong> Google may use this data to improve their models depending on their terms.</li>
                                    </ol>
                                </div>

                                <a
                                    href="https://ai.google.dev/gemini-api/terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Read Google Gemini API Terms of Service
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Liability & Accuracy */}
                <section className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                                <Scale className="w-8 h-8" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900">3. Regulatory Estimates vs. Reality</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Shipping hazardous materials is a legally regulated activity with strict penalties for non-compliance.
                                </p>

                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                                    <p className="text-amber-800 font-medium">
                                        "Trust, but Verify"
                                    </p>
                                    <p className="text-amber-700 text-sm mt-1">
                                        Thermal Hubble is an assistive tool, not a certified dangerous goods safety advisor.
                                        AI models can "hallucinate" (make up convincing but wrong facts).
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 pt-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">This tool is for:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc ml-4">
                                            <li>Quickly finding likely UN numbers</li>
                                            <li>Double-checking your own work</li>
                                            <li>Digitizing paper SDS documents</li>
                                            <li>Training and education</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">This tool is NOT:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc ml-4">
                                            <li>A replacement for official IATA/DOT regulations</li>
                                            <li>Legal advice</li>
                                            <li>A guarantee of shipment acceptance</li>
                                        </ul>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 italic mt-4">
                                    Always consult the current IATA DGR or 49 CFR regulations before finalizing a shipment.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-center pt-8 pb-12">
                    <button
                        onClick={onBack}
                        className="px-8 py-4 bg-gray-900 text-white text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-black transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                        I Understand - Take me back
                    </button>
                </div>
            </div>
        </div>
    );
}

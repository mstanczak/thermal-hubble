import type { ValidationResult, ValidationIssue, ValidationMetadata } from '../lib/gemini';
import { CheckCircle, AlertTriangle, Info, XCircle, ChevronDown, ChevronUp, Database, FileText, BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface ValidationResultProps {
    result: ValidationResult;
}

export function ValidationIntelligence({ metadata }: { metadata: ValidationMetadata }) {
    const [expanded, setExpanded] = useState(false);
    const [showFullPrompt, setShowFullPrompt] = useState(false);

    if (!metadata) return null;

    const truncatedPrompt = metadata.promptTemplate.length > 500
        ? metadata.promptTemplate.substring(0, 500) + "..."
        : metadata.promptTemplate;

    return (
        <div className="mt-8 border-t border-gray-200 pt-6">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors w-full"
            >
                <BrainCircuit className="w-4 h-4" />
                Validation Intelligence & Sources
                {expanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>

            {expanded && (
                <div className="mt-4 space-y-6 animate-in slide-in-from-top-2">
                    {/* Sources Section */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Context Sources Utilized</h4>
                        <div className="grid gap-2">
                            {metadata.sourcesUsed.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No external context or local documents were used for this analysis. (Pure model knowledge)</p>
                            ) : (
                                metadata.sourcesUsed.map((source, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {source.sourceType === 'MCP' ? (
                                                <Database className="w-3.5 h-3.5 text-purple-500" />
                                            ) : (
                                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                            )}
                                            <span className="truncate font-medium text-gray-700" title={source.sourceName}>{source.sourceName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-500">{source.sourceType}</span>
                                            <span
                                                className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full font-mono cursor-help"
                                                title="Weight indicates how much authority the AI gives to this source. 100% = Absolute Truth (overrides AI knowledge). 0% = Ignored."
                                            >
                                                {source.weight}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Extracted Data Section */}
                    {metadata.extractedData && Object.keys(metadata.extractedData).length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Extracted Image Data</h4>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Field</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extracted Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(metadata.extractedData).map(([key, value]) => (
                                            <tr key={key} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600 font-mono break-all">
                                                    {value === null || value === 'null' ? (
                                                        <span className="text-gray-400 italic">Not Found</span>
                                                    ) : typeof value === 'object' ? (
                                                        JSON.stringify(value)
                                                    ) : (
                                                        String(value)
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Prompt Logic Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Prompt Logic</h4>
                            <button
                                onClick={() => setShowFullPrompt(!showFullPrompt)}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                {showFullPrompt ? "Collapse" : "Expand Full Prompt"}
                            </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3 overflow-hidden group relative">
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                                {showFullPrompt ? metadata.promptTemplate : truncatedPrompt}
                            </pre>
                            <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 rounded text-[10px] text-gray-400 border border-gray-700">
                                Model: {metadata.modelId}
                            </div>
                        </div>
                        {!showFullPrompt && (
                            <p className="text-[10px] text-gray-400 mt-1">
                                * This is a truncated view. Click "Expand" to see the full prompt logic.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function IssueCard({ issue }: { issue: ValidationIssue }) {
    const [expanded, setExpanded] = useState(false);

    const icon = {
        'Critical': <XCircle className="w-5 h-5 text-red-600" />,
        'Warning': <AlertTriangle className="w-5 h-5 text-amber-600" />,
        'Info': <Info className="w-5 h-5 text-blue-600" />
    }[issue.severity];

    const borderClass = {
        'Critical': 'border-l-4 border-l-red-500',
        'Warning': 'border-l-4 border-l-amber-500',
        'Info': 'border-l-4 border-l-blue-500'
    }[issue.severity];

    return (
        <div className={clsx("bg-white rounded-lg shadow-sm border border-gray-200 p-4", borderClass)}>
            <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">{icon}</div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">{issue.description}</h4>
                        <span className={clsx(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            issue.severity === 'Critical' ? "bg-red-100 text-red-700" :
                                issue.severity === 'Warning' ? "bg-amber-100 text-amber-700" :
                                    "bg-blue-100 text-blue-700"
                        )}>
                            {issue.confidence}% Confidence
                        </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Fix: </span>
                        {issue.recommendation}
                    </div>

                    {expanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                            <div className="grid grid-cols-1 gap-2">
                                <div>
                                    <span className="font-medium text-gray-700">Regulation: </span>
                                    <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{issue.regulationReference}</span>
                                </div>
                                {issue.explanation && (
                                    <div className="text-gray-600">
                                        <span className="font-medium text-gray-700">Why this matters: </span>
                                        {issue.explanation}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}

export function ValidationResultCard({ result }: ValidationResultProps) {
    const statusColor = {
        'Pass': 'bg-green-50 text-green-700 border-green-200',
        'Fail': 'bg-red-50 text-red-700 border-red-200',
        'Warnings': 'bg-amber-50 text-amber-700 border-amber-200'
    }[result.status];

    const statusIcon = {
        'Pass': <CheckCircle className="w-8 h-8" />,
        'Fail': <XCircle className="w-8 h-8" />,
        'Warnings': <AlertTriangle className="w-8 h-8" />
    }[result.status];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className={clsx("p-6 rounded-xl border flex items-center gap-4", statusColor)}>
                {statusIcon}
                <div>
                    <h3 className="text-xl font-bold">
                        {result.status === 'Warnings' ? 'Passed Checks (with warnings)' : `Validation Status: ${result.status}`}
                    </h3>
                    <p className="text-sm opacity-90">
                        {result.issues.length} issue(s) found during analysis.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {result.issues.map((issue, index) => (
                    <IssueCard key={index} issue={issue} />
                ))}
            </div>

            {/* Intelligence Footer */}
            {result.metadata && <ValidationIntelligence metadata={result.metadata} />}
        </div>
    );
}

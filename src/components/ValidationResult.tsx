import type { ValidationResult, ValidationIssue } from '../lib/gemini';
import { CheckCircle, AlertTriangle, Info, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface ValidationResultProps {
    result: ValidationResult;
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        </div>
    );
}

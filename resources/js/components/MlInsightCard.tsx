/**
 * MlInsightCard — Tarjeta de predicción del motor ML de Tribio.
 * Muestra probabilidad, label y recomendaciones de forma visual.
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export interface MlPrediction {
    probability: number;
    prediction: 0 | 1;
    label: string;
    threshold?: number;
    recommendations?: string[];
}

interface Props {
    title: string;
    prediction: MlPrediction;
    className?: string;
    compact?: boolean; // modo compacto para tarjetas pequeñas
}

function getColorConfig(probability: number) {
    if (probability >= 0.70) {
        return {
            border: 'border-emerald-200',
            bg: 'bg-emerald-50',
            bar: 'bg-emerald-500',
            badge: 'bg-emerald-100 text-emerald-700',
            icon: 'text-emerald-600',
            label: 'text-emerald-700',
        };
    }
    if (probability >= 0.40) {
        return {
            border: 'border-amber-200',
            bg: 'bg-amber-50',
            bar: 'bg-amber-500',
            badge: 'bg-amber-100 text-amber-700',
            icon: 'text-amber-600',
            label: 'text-amber-700',
        };
    }
    return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        bar: 'bg-red-500',
        badge: 'bg-red-100 text-red-700',
        icon: 'text-red-600',
        label: 'text-red-700',
    };
}

export default function MlInsightCard({ title, prediction, className = '', compact = false }: Props) {
    const [showAll, setShowAll] = useState(false);

    const pct = Math.round(prediction.probability * 100);
    const colors = getColorConfig(prediction.probability);
    const recs = prediction.recommendations ?? [];
    const visibleRecs = showAll ? recs : recs.slice(0, 3);

    return (
        <div className={`rounded-xl border ${colors.border} ${colors.bg} ${compact ? 'p-3' : 'p-4'} ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <Sparkles className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${colors.icon}`} />
                    <span className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>
                        {title}
                    </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                    IA
                </span>
            </div>

            {/* Probability bar */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${colors.label} ${compact ? 'text-sm' : 'text-base'}`}>
                        {pct}%
                    </span>
                    <span className={`${colors.label} ${compact ? 'text-xs' : 'text-sm'} truncate max-w-[60%] text-right`}>
                        {prediction.label}
                    </span>
                </div>
                <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden border border-white/50">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* Recommendations */}
            {recs.length > 0 && !compact && (
                <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Recomendaciones
                    </p>
                    <ul className="space-y-1">
                        {visibleRecs.map((rec, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <span className="mt-0.5 flex-shrink-0 text-gray-400">•</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                    {recs.length > 3 && (
                        <button
                            onClick={() => setShowAll(v => !v)}
                            className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showAll ? (
                                <><ChevronUp className="w-3 h-3" /> Ver menos</>
                            ) : (
                                <><ChevronDown className="w-3 h-3" /> Ver {recs.length - 3} más</>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

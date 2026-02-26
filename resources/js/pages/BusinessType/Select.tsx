import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarCheck,
    ShoppingBag,
    Utensils,
    Check,
    ArrowRight,
    Sparkles,
    Clock,
} from 'lucide-react';

interface BusinessType {
    id: number;
    slug: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    features: string[];
    coming_soon: boolean;
}

interface Account {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    businessTypes: BusinessType[];
    account: Account | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'calendar-check': CalendarCheck,
    'shopping-bag': ShoppingBag,
    'utensils': Utensils,
};

const colorMap: Record<string, { bg: string; border: string; text: string; gradient: string; light: string }> = {
    cyan: {
        bg: 'bg-cyan-500',
        border: 'border-cyan-500',
        text: 'text-cyan-600',
        gradient: 'from-cyan-500 to-cyan-600',
        light: 'bg-cyan-50 dark:bg-cyan-500/10',
    },
    emerald: {
        bg: 'bg-emerald-500',
        border: 'border-emerald-500',
        text: 'text-emerald-600',
        gradient: 'from-emerald-500 to-emerald-600',
        light: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    amber: {
        bg: 'bg-amber-500',
        border: 'border-amber-500',
        text: 'text-amber-600',
        gradient: 'from-amber-500 to-amber-600',
        light: 'bg-amber-50 dark:bg-amber-500/10',
    },
};

export default function SelectBusinessType({ businessTypes, account }: Props) {
    const [selectedType, setSelectedType] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSelect = (typeId: number, comingSoon: boolean) => {
        if (comingSoon) return;
        setSelectedType(typeId);
    };

    const handleSubmit = () => {
        if (!selectedType || isSubmitting) return;

        setIsSubmitting(true);
        router.post('/business-type/store', {
            business_type_id: selectedType,
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Selecciona tu tipo de negocio" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Header decorativo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-20">
                    {/* Logo y Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white mb-6 shadow-lg shadow-cyan-500/30">
                            <Sparkles className="w-8 h-8" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                            ¿Qué tipo de negocio tienes?
                        </h1>

                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                            Selecciona el tipo que mejor describe tu negocio.
                            Esto nos ayudará a configurar las herramientas perfectas para ti.
                        </p>

                        {account && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Configurando:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{account.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Grid de tipos de negocio */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {businessTypes.map((type) => {
                            const Icon = iconMap[type.icon] || ShoppingBag;
                            const colors = colorMap[type.color] || colorMap.cyan;
                            const isSelected = selectedType === type.id;
                            const isDisabled = type.coming_soon;

                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleSelect(type.id, type.coming_soon)}
                                    disabled={isDisabled}
                                    className={`
                                        relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 text-left
                                        ${isSelected
                                            ? `${colors.border} ${colors.light} shadow-lg ring-4 ring-${type.color}-500/20`
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                        }
                                        ${isDisabled
                                            ? 'opacity-60 cursor-not-allowed'
                                            : 'hover:shadow-md cursor-pointer'
                                        }
                                    `}
                                >
                                    {/* Badge Coming Soon */}
                                    {type.coming_soon && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                                            <Clock className="w-3 h-3" />
                                            Próximamente
                                        </div>
                                    )}

                                    {/* Check de selección */}
                                    {isSelected && (
                                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}>
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    {/* Icono */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                                        <Icon className="w-7 h-7" />
                                    </div>

                                    {/* Nombre y descripción */}
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {type.name}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                                        {type.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-2">
                                        {type.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                                                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            );
                        })}
                    </div>

                    {/* Botón de continuar */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedType || isSubmitting}
                            className={`
                                inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all
                                ${selectedType
                                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Configurando...
                                </>
                            ) : (
                                <>
                                    Continuar
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Podrás cambiar esto más adelante en la configuración
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

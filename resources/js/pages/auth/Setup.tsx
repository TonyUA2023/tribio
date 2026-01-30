import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import WebLayout from '@/layouts/WebLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    children: Category[];
}

interface SetupProps {
    categories: Category[];
    accountName: string;
}

function Setup({ categories, accountName }: SetupProps) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        business_category_id: null as number | null,
        other_category: '',
    });

    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

    const handleCategorySelect = (category: Pick<Category, 'id' | 'slug'>) => {
        clearErrors();
        setSelectedSlug(category.slug);

        if (category.slug !== 'other') {
            setData({
                business_category_id: category.id,
                other_category: '',
            });
        } else {
            setData({
                business_category_id: null,
                other_category: '',
            });
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const allCategories = [...categories, { id: -1, name: 'Otro', slug: 'other', icon: null, children: [] }];

    return (
        <>
            <Head title="Configuración del Negocio" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                    {/* Paso 1: Bienvenida */}
                    {step === 1 && (
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                ¡Bienvenido a Tribio!
                            </h1>
                            <p className="mt-2 text-base text-slate-600">
                                Estás a punto de lanzar tu negocio al mundo. Primero, confirmemos tus datos.
                            </p>
                            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                                <Label className="text-xs text-slate-500">Nombre del Negocio</Label>
                                <p className="text-lg font-semibold text-slate-800">{accountName}</p>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button onClick={() => setStep(2)} size="lg" className="w-full md:w-auto">
                                    Continuar →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Selección de Categoría */}
                    {step === 2 && (
                        <form onSubmit={submit}>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    ¿A qué se dedica tu negocio?
                                </h2>
                                <p className="mt-1 text-slate-600">
                                    Selecciona la categoría que mejor lo describa. Esto nos ayudará a sugerirte las
                                    mejores herramientas.
                                </p>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                                {allCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleCategorySelect(category)}
                                        className={`flex h-24 items-center justify-center rounded-xl border p-4 text-center font-semibold transition-all ${
                                            selectedSlug === category.slug
                                                ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.business_category_id} className="mt-2" />

                            {selectedSlug === 'other' && (
                                <div className="mt-6 space-y-2">
                                    <Label htmlFor="other_category">
                                        Por favor, especifica tu tipo de negocio:
                                    </Label>
                                    <Input
                                        id="other_category"
                                        name="other_category"
                                        value={data.other_category}
                                        onChange={(e) => setData('other_category', e.target.value)}
                                        className="block w-full"
                                        placeholder="Ej: Venta de Ropa, Consultoría, etc."
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.other_category} className="mt-2" />
                                </div>
                            )}

                            <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
                                <Button variant="ghost" onClick={() => setStep(1)} type="button">
                                    ← Atrás
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={processing || (!data.business_category_id && !data.other_category)}
                                >
                                    {processing ? 'Guardando...' : 'Finalizar Configuración'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

Setup.layout = (page: ReactNode) => <WebLayout showFooter={false}>{page}</WebLayout>;

export default Setup;
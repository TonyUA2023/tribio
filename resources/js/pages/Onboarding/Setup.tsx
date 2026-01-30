import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import WebLayout from '@/layouts/WebLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';

interface Module {
    id: number;
    name: string;
    description: string;
}

interface TemplateConfig {
    primaryColor?: string;
    backgroundColor?: string;
    accentColor?: string;
}

interface Template {
    id: number;
    name: string;
    preview_url?: string;
    config?: TemplateConfig | string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    children: Category[];
    modules: Module[];
}

interface SetupProps {
    categories: Category[];
    templates: Template[];
    accountName: string;
}

function Setup({ categories, templates, accountName }: SetupProps) {
    const [step, setStep] = useState(1);
    const [categoryView, setCategoryView] = useState<'parents' | 'children'>('parents');
    const [selectedParent, setSelectedParent] = useState<Category | null>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        business_category_id: null as number | null,
        other_category: '',
        template_id: null as number | null,
    });

    const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);

    // Normalizamos templates para manejar tanto arrays directos como Resource Collections de Laravel
    console.log('Templates received:', templates);
    const availableTemplates = Array.isArray(templates) ? templates : (templates as any)?.data || [];

    const handleParentCategorySelect = (parentCategory: Category) => {
        setSelectedParent(parentCategory);
        setCategoryView('children');
    };

    const handleSubCategorySelect = (subCategory: Category) => {
        clearErrors();
        setSelectedSubCategory(subCategory);

        if (subCategory.slug !== 'other') {
            setData((prevData) => ({
                ...prevData,
                business_category_id: subCategory.id,
                other_category: '',
            }));
        } else {
            setData((prevData) => ({
                ...prevData,
                business_category_id: null,
                other_category: '',
            }));
        }
    };

    const backToParentCategories = () => {
        setCategoryView('parents');
        setSelectedParent(null);
        setSelectedSubCategory(null);
        setData('business_category_id', null);
    };

    const handleTemplateSelect = (templateId: number) => {
        setData('template_id', templateId);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/onboarding');
    };

    const getTemplateConfig = (template: Template): TemplateConfig => {
        if (typeof template.config === 'string') {
            try {
                return JSON.parse(template.config);
            } catch {
                return {};
            }
        }
        return template.config || {};
    };

    const otherCategory: Category = {
        id: -1,
        name: 'Otro',
        slug: 'other',
        icon: null,
        children: [],
        modules: [],
    };

    return (
        <>
            <Head title="Configuración del Negocio" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
                <form onSubmit={submit} className="w-full max-w-2xl">
                    <div className="w-full space-y-8 rounded-2xl bg-white p-8 shadow-lg">
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
                        <div>
                            {categoryView === 'parents' && (
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                        ¿A qué se dedica tu negocio?
                                    </h2>
                                    <p className="mt-1 text-slate-600">
                                        Selecciona la categoría que mejor lo describa. Esto nos ayudará a sugerirte
                                        las mejores herramientas.
                                    </p>
                                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {categories?.map((category) => (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => handleParentCategorySelect(category)}
                                                className="flex h-24 items-center justify-center rounded-xl border p-4 text-center font-semibold transition-all border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                        <button
                                            key={otherCategory.id}
                                            type="button"
                                            onClick={() => handleSubCategorySelect(otherCategory)}
                                            className={`flex h-24 items-center justify-center rounded-xl border p-4 text-center font-semibold transition-all ${
                                                selectedSubCategory?.slug === 'other'
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {otherCategory.name}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {categoryView === 'children' && selectedParent && (
                                <div>
                                    <div className="relative mb-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={backToParentCategories}
                                            type="button"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 px-2"
                                        >
                                            ← Volver
                                        </Button>
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                            ¿Qué tipo de {selectedParent.name}?
                                        </h2>
                                    </div>
                                    <p className="mt-1 text-center text-slate-600">
                                        Ahora elige la opción más específica.
                                    </p>
                                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {selectedParent.children.map((subCategory) => (
                                            <button
                                                key={subCategory.id}
                                                type="button"
                                                onClick={() => handleSubCategorySelect(subCategory)}
                                                className={`flex h-24 items-center justify-center rounded-xl border p-4 text-center font-semibold transition-all ${
                                                    selectedSubCategory?.id === subCategory.id
                                                        ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                {subCategory.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <InputError message={errors.business_category_id} className="mt-2" />

                            {selectedSubCategory?.slug === 'other' && (
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
                                    type="button"
                                    size="lg"
                                    onClick={() => setStep(3)}
                                    disabled={!data.business_category_id && !data.other_category}
                                >
                                    Continuar →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Selección de Plantilla */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Elige una plantilla
                            </h2>
                            <p className="mt-1 text-slate-600">
                                Selecciona el diseño con el que quieres empezar. Podrás personalizarlo más adelante.
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                                {availableTemplates.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-slate-500">
                                        <p>No se encontraron plantillas disponibles.</p>
                                    </div>
                                )}
                                {availableTemplates.map((template) => {
                                    const config = getTemplateConfig(template);
                                    return (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => handleTemplateSelect(template.id)}
                                            className={`group relative block overflow-hidden rounded-xl border transition-all ${
                                                data.template_id === template.id
                                                    ? 'border-sky-500 ring-2 ring-sky-500'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {template.preview_url ? (
                                                <img
                                                    src={template.preview_url}
                                                    alt={template.name}
                                                    className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div 
                                                    className="h-32 w-full transition-transform group-hover:scale-105 flex items-center justify-center"
                                                    style={{ backgroundColor: config.backgroundColor || '#18181b' }}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div 
                                                            className="h-8 w-8 rounded-full opacity-80"
                                                            style={{ backgroundColor: config.primaryColor || '#06b6d4' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                                            <p className="text-sm font-semibold text-white">{template.name}</p>
                                        </div>
                                    </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.template_id} className="mt-2" />

                            <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
                                <Button variant="ghost" onClick={() => setStep(2)} type="button">
                                    ← Atrás
                                </Button>
                                <Button type="submit" size="lg" disabled={processing || !data.template_id}>
                                    {processing ? 'Guardando...' : 'Finalizar Configuración'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                </form>
            </div>
        </>
    );
}

Setup.layout = (page: ReactNode) => <WebLayout showFooter={false}>{page}</WebLayout>;

export default Setup;
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Video, Clock, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useToast } from '@/contexts/ToastContext';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historias',
        href: '/stories',
    },
    {
        title: 'Crear Historia',
        href: '/stories/create',
    },
];

interface Profile {
    id: number;
    name: string;
}

interface Props {
    profile: Profile;
}

export default function CreateStory({ profile }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Aumentar el límite a 100MB para videos
        if (file.size > 100 * 1024 * 1024) {
            toast.error('El archivo es muy grande. Máximo 100MB.');
            return;
        }

        // Aceptar más tipos de archivos incluyendo extensiones móviles
        const validTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'image/webp', 'image/heic', 'image/heif',
            'video/mp4', 'video/quicktime', 'video/x-msvideo',
            'video/x-matroska', 'video/webm'
        ];

        // Para HEIC en móviles iOS, el tipo puede venir vacío
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'mp4', 'mov', 'avi', 'mkv', 'webm'];

        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
            toast.error('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, HEIC) y videos (MP4, MOV).');
            return;
        }

        setSelectedFile(file);

        // Crear preview - para HEIC usar URL.createObjectURL
        try {
            setPreview(URL.createObjectURL(file));
        } catch (error) {
            console.error('Error creating preview:', error);
            toast.warning('No se puede mostrar vista previa, pero el archivo se cargará correctamente');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !profile) {
            toast.error('Por favor selecciona una imagen o video');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('profile_id', profile.id.toString());
        formData.append('media', selectedFile);
        if (caption) formData.append('caption', caption);

        try {
            const response = await fetch('/api/stories', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                toast.success('¡Historia publicada exitosamente!');
                setTimeout(() => router.visit('/stories'), 1000);
            } else {
                toast.error(data.message || 'Error al publicar historia');
            }
        } catch (error) {
            console.error('Error uploading story:', error);
            toast.error('Error al conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const removeFile = () => {
        if (preview) URL.revokeObjectURL(preview);
        setSelectedFile(null);
        setPreview(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Historia" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Crear Nueva Historia</h1>
                    <p className="text-muted-foreground mt-1">
                        Comparte una imagen o video que estará visible durante 24 horas
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Upload zone */}
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        {!preview ? (
                            <label className="cursor-pointer block">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="bg-muted p-4 rounded-full">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">
                                            Haz clic para seleccionar imagen o video
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Máximo 10MB - JPG, PNG, GIF, WebP, MP4, MOV
                                        </p>
                                    </div>
                                </div>
                            </label>
                        ) : (
                            <div className="relative">
                                <div className="max-w-xs mx-auto aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                                    {selectedFile?.type.startsWith('video') ? (
                                        <video
                                            src={preview}
                                            className="w-full h-full object-contain"
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={preview}
                                            className="w-full h-full object-contain"
                                            alt="Preview"
                                        />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    onClick={removeFile}
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                >
                                    <X className="w-4 h-4" />
                                </Button>

                                <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        {selectedFile?.type.startsWith('video') ? (
                                            <Video className="w-4 h-4" />
                                        ) : (
                                            <ImageIcon className="w-4 h-4" />
                                        )}
                                        <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{(selectedFile!.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Caption */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Escribe una descripción para tu historia..."
                            rows={3}
                            maxLength={500}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {caption.length}/500 caracteres
                        </p>
                    </div>

                    {/* Info cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/50 border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <h4 className="font-medium text-sm">Duración</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tu historia se eliminará automáticamente después de 24 horas
                            </p>
                        </div>

                        <div className="bg-muted/50 border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-primary" />
                                <h4 className="font-medium text-sm">Visibilidad</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Aparecerá en tu perfil público para todos tus visitantes
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/stories')}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedFile || loading}
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Publicando...
                                </>
                            ) : (
                                'Publicar Historia (24h)'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

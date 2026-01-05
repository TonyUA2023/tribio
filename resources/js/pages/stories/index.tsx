import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Clock, Eye, Trash2, BookOpen } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historias',
        href: '/stories',
    },
];

interface Story {
    id: number;
    media_url: string;
    media_type: 'image' | 'video';
    caption: string | null;
    views_count: number;
    created_at: string;
    expires_at: string;
    time_remaining: string;
    is_expired: boolean;
    profile: {
        id: number;
        name: string;
    };
}

export default function StoriesIndex() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const response = await fetch('/api/my-stories', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setStories(data.data.data);
            }
        } catch (error) {
            console.error('Error al cargar stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (storyId: number) => {
        if (!confirm('¿Estás seguro de eliminar esta historia?')) return;

        try {
            const response = await fetch(`/api/stories/${storyId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setStories(stories.filter(s => s.id !== storyId));
                alert('Historia eliminada exitosamente');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar la historia');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historias" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Mis Historiasss</h1>
                        <p className="text-muted-foreground mt-1">Gestiona tus historias de 24 horas</p>
                    </div>

                    <Button
                        onClick={() => router.visit('/stories/create')}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Crear Historia
                    </Button>
                </div>

                {/* Info banner */}
                <div className="bg-muted/50 border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                Las historias duran 24 horas
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tus historias aparecerán en tu perfil público y se eliminarán automáticamente después de 24 horas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stories Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-muted-foreground mt-4">Cargando historias...</p>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-lg">
                        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No tienes historias activas
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            Crea tu primera historia y compártela con tus clientes
                        </p>
                        <Button
                            onClick={() => router.visit('/stories/create')}
                        >
                            Crear Primera Historia
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stories.map((story) => (
                            <div
                                key={story.id}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Media Preview */}
                                <div className="aspect-[9/16] bg-muted relative overflow-hidden">
                                    {story.media_type === 'image' ? (
                                        <img
                                            src={story.media_url}
                                            alt="Story"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={story.media_url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    )}

                                    {/* Expired overlay */}
                                    {story.is_expired && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                Expirada
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-3">
                                    {story.caption && (
                                        <p className="text-sm line-clamp-2">
                                            {story.caption}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            <span>{story.views_count} vistas</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{story.time_remaining}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleDelete(story.id)}
                                        variant="destructive"
                                        size="sm"
                                        className="w-full gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

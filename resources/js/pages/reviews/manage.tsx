import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Star,
    StarOff,
    Trash2,
    Check,
    X,
    GripVertical,
    ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
    id: number;
    client_name: string;
    client_email: string | null;
    rating: number;
    comment: string;
    image_path: string | null;
    image_url: string | null;
    is_featured: boolean;
    display_order: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface Profile {
    id: number;
    name: string;
}

interface PageProps {
    reviews: Review[];
    profile: Profile;
}

export default function ManageReviews() {
    const { reviews: initialReviews, profile } = usePage<PageProps>().props;
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [selectedStatus, setSelectedStatus] = useState<
        'all' | 'pending' | 'approved' | 'rejected'
    >('all');

    const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Reseñas', href: '/reviews/manage' },
    ];

    const filteredReviews = reviews.filter((review) => {
        if (selectedStatus === 'all') return true;
        return review.status === selectedStatus;
    });

    const handleToggleFeatured = (reviewId: number) => {
        router.patch(
            `/reviews/${reviewId}/toggle-featured`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const updatedReview = page.props.review;
                    setReviews((prev) =>
                        prev.map((r) =>
                            r.id === reviewId
                                ? { ...r, is_featured: updatedReview.is_featured }
                                : r,
                        ),
                    );
                },
            },
        );
    };

    const handleDelete = (reviewId: number) => {
        if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

        router.delete(`/reviews/${reviewId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setReviews((prev) => prev.filter((r) => r.id !== reviewId));
            },
        });
    };

    const handleApprove = (reviewId: number) => {
        router.patch(
            `/reviews/${reviewId}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const updatedReview = page.props.review;
                    setReviews((prev) =>
                        prev.map((r) =>
                            r.id === reviewId
                                ? { ...r, status: updatedReview.status }
                                : r,
                        ),
                    );
                },
            },
        );
    };

    const handleReject = (reviewId: number) => {
        router.patch(
            `/reviews/${reviewId}/reject`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const updatedReview = page.props.review;
                    setReviews((prev) =>
                        prev.map((r) =>
                            r.id === reviewId
                                ? { ...r, status: updatedReview.status }
                                : r,
                        ),
                    );
                },
            },
        );
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            'h-4 w-4',
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300',
                        )}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: (
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    Pendiente
                </span>
            ),
            approved: (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Aprobada
                </span>
            ),
            rejected: (
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    Rechazada
                </span>
            ),
        };
        return badges[status as keyof typeof badges];
    };

    const pendingCount = reviews.filter((r) => r.status === 'pending').length;
    const approvedCount = reviews.filter(
        (r) => r.status === 'approved',
    ).length;
    const featuredCount = reviews.filter((r) => r.is_featured).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administrar Reseñas" />

            <div className="mx-auto max-w-7xl space-y-6 py-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Administrar Reseñas
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Gestiona las reseñas de tu perfil{' '}
                        <span className="font-semibold">{profile.name}</span>
                    </p>
                </div>

                {/* Estadísticas */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="text-2xl font-bold">{reviews.length}</div>
                        <p className="text-sm text-muted-foreground">
                            Total de Reseñas
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-6">
                        <div className="text-2xl font-bold text-yellow-600">
                            {pendingCount}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Pendientes
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-6">
                        <div className="text-2xl font-bold text-green-600">
                            {approvedCount}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Aprobadas
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-6">
                        <div className="text-2xl font-bold text-blue-600">
                            {featuredCount}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Destacadas
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                    <Button
                        variant={selectedStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStatus('all')}
                    >
                        Todas ({reviews.length})
                    </Button>
                    <Button
                        variant={
                            selectedStatus === 'pending' ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedStatus('pending')}
                    >
                        Pendientes ({pendingCount})
                    </Button>
                    <Button
                        variant={
                            selectedStatus === 'approved' ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedStatus('approved')}
                    >
                        Aprobadas ({approvedCount})
                    </Button>
                    <Button
                        variant={
                            selectedStatus === 'rejected' ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedStatus('rejected')}
                    >
                        Rechazadas (
                        {reviews.filter((r) => r.status === 'rejected').length})
                    </Button>
                </div>

                {/* Lista de reseñas */}
                <div className="space-y-4">
                    {filteredReviews.length === 0 ? (
                        <div className="rounded-lg border bg-card p-12 text-center">
                            <p className="text-muted-foreground">
                                No hay reseñas en esta categoría
                            </p>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div
                                key={review.id}
                                className={cn(
                                    'rounded-lg border bg-card p-6 transition-all',
                                    review.is_featured &&
                                        'border-yellow-400 bg-yellow-50/50',
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Drag handle (para futuro drag & drop) */}
                                    <div className="flex flex-col items-center gap-2">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>

                                    {/* Imagen de la reseña si existe */}
                                    {review.image_url && (
                                        <div className="shrink-0">
                                            <img
                                                src={review.image_url}
                                                alt="Foto del trabajo"
                                                className="h-24 w-24 rounded-lg object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Contenido */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        {review.client_name}
                                                    </h3>
                                                    {review.is_featured && (
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    )}
                                                    {getStatusBadge(review.status)}
                                                </div>
                                                {renderStars(review.rating)}
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex gap-2">
                                                {/* Destacar/Quitar destacado */}
                                                <Button
                                                    size="icon"
                                                    variant={
                                                        review.is_featured
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        handleToggleFeatured(
                                                            review.id,
                                                        )
                                                    }
                                                    title={
                                                        review.is_featured
                                                            ? 'Quitar destacado'
                                                            : 'Marcar como destacada'
                                                    }
                                                >
                                                    {review.is_featured ? (
                                                        <StarOff className="h-4 w-4" />
                                                    ) : (
                                                        <Star className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                {/* Aprobar (solo si está pendiente) */}
                                                {review.status === 'pending' && (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="text-green-600 hover:bg-green-50"
                                                        onClick={() =>
                                                            handleApprove(
                                                                review.id,
                                                            )
                                                        }
                                                        title="Aprobar reseña"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {/* Rechazar (solo si está pendiente) */}
                                                {review.status === 'pending' && (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="text-red-600 hover:bg-red-50"
                                                        onClick={() =>
                                                            handleReject(review.id)
                                                        }
                                                        title="Rechazar reseña"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {/* Eliminar */}
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={() =>
                                                        handleDelete(review.id)
                                                    }
                                                    title="Eliminar reseña"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {review.comment}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {new Date(
                                                review.created_at,
                                            ).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

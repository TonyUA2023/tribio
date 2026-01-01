import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import {
    Image as ImageIcon,
    Loader2,
    Play,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración',
        href: '/settings',
    },
    {
        title: 'Página',
        href: '/settings/page',
    },
];

interface Media {
    id: number;
    type: 'image' | 'video';
    url: string;
    file_name: string;
    file_size: string;
    caption?: string;
    order: number;
}

interface LoadingScreen {
    id: number;
    type: 'image';
    url: string;
    file_name: string;
}

interface ProfileLogo {
    id: number;
    type: 'image';
    url: string;
    file_name: string;
}

interface CoverPhoto {
    id: number;
    type: 'image';
    url: string;
    file_name: string;
}

interface PageSettingsProps {
    galleryMedia: Media[];
    loadingScreen: LoadingScreen | null;
    profileLogo: ProfileLogo | null;
    coverPhoto: CoverPhoto | null;
}

export default function PageSettings({
    galleryMedia = [],
    loadingScreen,
    profileLogo,
    coverPhoto,
}: PageSettingsProps) {
    const [gallery, setGallery] = useState<Media[]>(galleryMedia);
    const [loadingScreenLogo, setLoadingScreenLogo] =
        useState<LoadingScreen | null>(loadingScreen);
    const [profileLogoImg, setProfileLogoImg] =
        useState<ProfileLogo | null>(profileLogo);
    const [coverPhotoImg, setCoverPhotoImg] =
        useState<CoverPhoto | null>(coverPhoto);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingProfileLogo, setUploadingProfileLogo] = useState(false);
    const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [currentFile, setCurrentFile] = useState<number>(0);
    const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [profileLogoPreview, setProfileLogoPreview] = useState<string | null>(null);
    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
    const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<FileList | null>(null);
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [selectedProfileLogoFile, setSelectedProfileLogoFile] = useState<File | null>(null);
    const [selectedCoverPhotoFile, setSelectedCoverPhotoFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const profileLogoInputRef = useRef<HTMLInputElement>(null);
    const coverPhotoInputRef = useRef<HTMLInputElement>(null);

    const handleGalleryFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setSelectedGalleryFiles(files);
        setUploadError(null);

        // Crear previews usando Object URLs (más eficiente para archivos grandes)
        const previews: string[] = [];
        Array.from(files).forEach((file) => {
            // Usar createObjectURL para archivos grandes y videos
            const objectUrl = URL.createObjectURL(file);
            previews.push(objectUrl);
        });
        setGalleryPreview(previews);
    };

    const confirmGalleryUpload = async () => {
        if (!selectedGalleryFiles) return;

        setUploadingGallery(true);
        setUploadError(null);
        setUploadProgress(0);

        const totalFiles = selectedGalleryFiles.length;

        for (let i = 0; i < totalFiles; i++) {
            setCurrentFile(i + 1);
            const file = selectedGalleryFiles[i];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/settings/page/upload-gallery', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    setGallery((prev) => [...prev, data.media]);
                    setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
                } else {
                    setUploadError(data.error || 'Error al subir archivo');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                setUploadError('Error al subir archivo. Por favor intenta de nuevo.');
            }
        }

        // Limpiar Object URLs después de subir
        galleryPreview.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });

        setUploadingGallery(false);
        setUploadProgress(0);
        setCurrentFile(0);
        setGalleryPreview([]);
        setSelectedGalleryFiles(null);
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
        }
    };

    const cancelGalleryUpload = () => {
        // Limpiar Object URLs para liberar memoria
        galleryPreview.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        setGalleryPreview([]);
        setSelectedGalleryFiles(null);
        setUploadError(null);
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
        }
    };

    const handleLogoFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedLogoFile(file);
        setUploadError(null);

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const confirmLogoUpload = async () => {
        if (!selectedLogoFile) return;

        setUploadingLogo(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', selectedLogoFile);

        try {
            const response = await fetch(
                '/settings/page/upload-loading-screen',
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const data = await response.json();

            if (data.success) {
                setLoadingScreenLogo(data.media);
                setLogoPreview(null);
                setSelectedLogoFile(null);
            } else {
                setUploadError(data.error || 'Error al subir logo');
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            setUploadError('Error al subir logo. Por favor intenta de nuevo.');
        }

        setUploadingLogo(false);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const cancelLogoUpload = () => {
        setLogoPreview(null);
        setSelectedLogoFile(null);
        setUploadError(null);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const handleProfileLogoFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedProfileLogoFile(file);
        setUploadError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const confirmProfileLogoUpload = async () => {
        if (!selectedProfileLogoFile) return;

        setUploadingProfileLogo(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', selectedProfileLogoFile);

        try {
            const response = await fetch(
                '/settings/page/upload-profile-logo',
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const data = await response.json();

            if (data.success) {
                setProfileLogoImg(data.media);
                setProfileLogoPreview(null);
                setSelectedProfileLogoFile(null);
            } else {
                setUploadError(data.error || 'Error al subir logo de perfil');
            }
        } catch (error) {
            console.error('Error uploading profile logo:', error);
            setUploadError('Error al subir logo de perfil. Por favor intenta de nuevo.');
        }

        setUploadingProfileLogo(false);
        if (profileLogoInputRef.current) {
            profileLogoInputRef.current.value = '';
        }
    };

    const cancelProfileLogoUpload = () => {
        setProfileLogoPreview(null);
        setSelectedProfileLogoFile(null);
        setUploadError(null);
        if (profileLogoInputRef.current) {
            profileLogoInputRef.current.value = '';
        }
    };

    const handleCoverPhotoFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedCoverPhotoFile(file);
        setUploadError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const confirmCoverPhotoUpload = async () => {
        if (!selectedCoverPhotoFile) return;

        setUploadingCoverPhoto(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', selectedCoverPhotoFile);

        try {
            const response = await fetch(
                '/settings/page/upload-cover-photo',
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const data = await response.json();

            if (data.success) {
                setCoverPhotoImg(data.media);
                setCoverPhotoPreview(null);
                setSelectedCoverPhotoFile(null);
            } else {
                setUploadError(data.error || 'Error al subir foto de portada');
            }
        } catch (error) {
            console.error('Error uploading cover photo:', error);
            setUploadError('Error al subir foto de portada. Por favor intenta de nuevo.');
        }

        setUploadingCoverPhoto(false);
        if (coverPhotoInputRef.current) {
            coverPhotoInputRef.current.value = '';
        }
    };

    const cancelCoverPhotoUpload = () => {
        setCoverPhotoPreview(null);
        setSelectedCoverPhotoFile(null);
        setUploadError(null);
        if (coverPhotoInputRef.current) {
            coverPhotoInputRef.current.value = '';
        }
    };

    const handleDeleteMedia = (mediaId: number) => {
        router.delete(`/settings/page/media/${mediaId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setGallery((prev) => prev.filter((m) => m.id !== mediaId));
            },
        });
    };

    const handleDeleteLogo = () => {
        if (!loadingScreenLogo) return;

        router.delete(`/settings/page/media/${loadingScreenLogo.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setLoadingScreenLogo(null);
            },
        });
    };

    const handleDeleteProfileLogo = () => {
        if (!profileLogoImg) return;

        router.delete(`/settings/page/media/${profileLogoImg.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setProfileLogoImg(null);
            },
        });
    };

    const handleDeleteCoverPhoto = () => {
        if (!coverPhotoImg) return;

        router.delete(`/settings/page/media/${coverPhotoImg.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setCoverPhotoImg(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Página" />

            <div className="mx-auto max-w-4xl space-y-6 py-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Configuración de Página
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Personaliza el contenido multimedia de tu página de
                        reservas
                    </p>
                </div>

                <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <HeadingSmall
                        title="Galería Multimedia"
                        description="Sube fotos y videos para mostrar en tu página (soporta HEIC, JPG, PNG, GIF, MP4, MOV, AVI)"
                    />

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Fotos y Videos</Label>
                            <input
                                ref={galleryInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*,.heic"
                                onChange={handleGalleryFileSelect}
                                className="hidden"
                            />

                            {galleryPreview.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border bg-muted p-4">
                                        <p className="mb-3 text-sm font-medium">
                                            Vista Previa ({galleryPreview.length} archivo{galleryPreview.length > 1 ? 's' : ''})
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                            {galleryPreview.map((preview, index) => {
                                                const file = selectedGalleryFiles?.[index];
                                                const isVideo = file?.type.startsWith('video/');

                                                return (
                                                    <div key={index} className="overflow-hidden rounded-lg border bg-background">
                                                        {isVideo ? (
                                                            <video
                                                                src={preview}
                                                                className="h-32 w-full object-cover bg-black"
                                                                muted
                                                            />
                                                        ) : (
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="h-32 w-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={confirmGalleryUpload}
                                            disabled={uploadingGallery}
                                            className="flex-1"
                                        >
                                            {uploadingGallery ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Subiendo {currentFile}/{selectedGalleryFiles?.length} ({uploadProgress}%)
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Subir {galleryPreview.length} archivo{galleryPreview.length > 1 ? 's' : ''}
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelGalleryUpload}
                                            disabled={uploadingGallery}
                                            variant="outline"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() =>
                                        !uploadingGallery &&
                                        galleryInputRef.current?.click()
                                    }
                                    className={cn(
                                        'rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors cursor-pointer',
                                        !uploadingGallery &&
                                            'hover:border-muted-foreground/50',
                                    )}
                                >
                                    <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="mb-2 text-sm font-medium">
                                        Arrastra archivos aquí o haz clic para seleccionar
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Formatos soportados: JPG, PNG, GIF, HEIC,
                                        WEBP, MP4, MOV, AVI
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Tamaño máximo: 100MB por archivo (videos se
                                        comprimen automáticamente)
                                    </p>
                                </div>
                            )}

                            {uploadError && (
                                <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                                    <p className="text-sm text-destructive">{uploadError}</p>
                                </div>
                            )}
                        </div>

                        {gallery.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {gallery.map((media) => (
                                    <div
                                        key={media.id}
                                        className="group relative overflow-hidden rounded-lg border bg-muted"
                                    >
                                        {media.type === 'image' ? (
                                            <img
                                                src={media.url}
                                                alt={media.file_name}
                                                className="h-48 w-full object-cover"
                                            />
                                        ) : (
                                            <div className="relative h-48 w-full bg-black">
                                                <video
                                                    src={media.url}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <Play className="h-12 w-12 text-white" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <p className="truncate text-sm font-medium">
                                                {media.file_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {media.file_size}
                                            </p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={() =>
                                                handleDeleteMedia(media.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <HeadingSmall
                        title="Pantalla de Carga"
                        description="Personaliza la pantalla que ven tus clientes mientras carga tu página"
                    />

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Logo de Carga</Label>

                            {loadingScreenLogo && !logoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={loadingScreenLogo.url}
                                        alt="Loading screen logo"
                                        className="h-32 w-32 rounded-lg border object-contain bg-muted p-2"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -right-2 -top-2 h-8 w-8"
                                        onClick={handleDeleteLogo}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : logoPreview ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border bg-muted p-4">
                                        <p className="mb-3 text-sm font-medium">
                                            Vista Previa del Logo
                                        </p>
                                        <div className="flex justify-center">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="h-32 w-32 rounded-lg border bg-background object-contain p-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={confirmLogoUpload}
                                            disabled={uploadingLogo}
                                            className="flex-1"
                                        >
                                            {uploadingLogo ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Subir Logo
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelLogoUpload}
                                            disabled={uploadingLogo}
                                            variant="outline"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*,.heic"
                                        onChange={handleLogoFileSelect}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() =>
                                            !uploadingLogo &&
                                            logoInputRef.current?.click()
                                        }
                                        className={cn(
                                            'rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors cursor-pointer',
                                            !uploadingLogo &&
                                                'hover:border-muted-foreground/50',
                                        )}
                                    >
                                        <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="mb-2 text-sm font-medium">
                                            Sube tu logo personalizado
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Formatos: PNG, JPG, GIF, HEIC, WEBP
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Tamaño recomendado: 200x200px (fondo transparente)
                                        </p>
                                    </div>
                                </>
                            )}

                            {uploadError && !galleryPreview.length && (
                                <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                                    <p className="text-sm text-destructive">{uploadError}</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm font-medium">
                                Vista Previa de Pantalla de Carga
                            </p>
                            <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-lg border bg-background">
                                <div className="text-center">
                                    {loadingScreenLogo ? (
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                                            <img
                                                src={loadingScreenLogo.url}
                                                alt="Loading"
                                                className="h-full w-full object-contain animate-pulse"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                        </div>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Cargando...
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {loadingScreenLogo
                                    ? 'Esta es una vista previa de cómo se verá tu pantalla de carga con tu logo personalizado.'
                                    : 'Esta es una vista previa de cómo se verá tu pantalla de carga. Si no subes un logo, se mostrará la animación por defecto.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <HeadingSmall
                        title="Logo del Perfil"
                        description="Sube el logo circular que aparecerá en tu mini-página (ej: ML BARBER)"
                    />

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Logo Circular</Label>

                            {profileLogoImg && !profileLogoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={profileLogoImg.url}
                                        alt="Profile logo"
                                        className="h-32 w-32 rounded-full border object-cover bg-muted p-2"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -right-2 -top-2 h-8 w-8"
                                        onClick={handleDeleteProfileLogo}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : profileLogoPreview ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border bg-muted p-4">
                                        <p className="mb-3 text-sm font-medium">
                                            Vista Previa del Logo
                                        </p>
                                        <div className="flex justify-center">
                                            <img
                                                src={profileLogoPreview}
                                                alt="Profile logo preview"
                                                className="h-32 w-32 rounded-full border bg-background object-cover p-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={confirmProfileLogoUpload}
                                            disabled={uploadingProfileLogo}
                                            className="flex-1"
                                        >
                                            {uploadingProfileLogo ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Subir Logo
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelProfileLogoUpload}
                                            disabled={uploadingProfileLogo}
                                            variant="outline"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <input
                                        ref={profileLogoInputRef}
                                        type="file"
                                        accept="image/*,.heic"
                                        onChange={handleProfileLogoFileSelect}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() =>
                                            !uploadingProfileLogo &&
                                            profileLogoInputRef.current?.click()
                                        }
                                        className={cn(
                                            'rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors cursor-pointer',
                                            !uploadingProfileLogo &&
                                                'hover:border-muted-foreground/50',
                                        )}
                                    >
                                        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="mb-2 text-sm font-medium">
                                            Sube el logo de tu perfil
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Formatos: PNG, JPG, GIF, HEIC, WEBP
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Tamaño recomendado: 200x200px (circular)
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <HeadingSmall
                        title="Foto de Portada"
                        description="Sube la imagen de fondo/header que aparecerá en la parte superior de tu mini-página"
                    />

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Imagen de Portada</Label>

                            {coverPhotoImg && !coverPhotoPreview ? (
                                <div className="relative inline-block w-full max-w-2xl">
                                    <img
                                        src={coverPhotoImg.url}
                                        alt="Cover photo"
                                        className="h-48 w-full rounded-lg border object-cover bg-muted"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -right-2 -top-2 h-8 w-8"
                                        onClick={handleDeleteCoverPhoto}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : coverPhotoPreview ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border bg-muted p-4">
                                        <p className="mb-3 text-sm font-medium">
                                            Vista Previa de la Portada
                                        </p>
                                        <div className="flex justify-center">
                                            <img
                                                src={coverPhotoPreview}
                                                alt="Cover photo preview"
                                                className="h-48 w-full max-w-2xl rounded-lg border bg-background object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={confirmCoverPhotoUpload}
                                            disabled={uploadingCoverPhoto}
                                            className="flex-1"
                                        >
                                            {uploadingCoverPhoto ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Subir Portada
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelCoverPhotoUpload}
                                            disabled={uploadingCoverPhoto}
                                            variant="outline"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <input
                                        ref={coverPhotoInputRef}
                                        type="file"
                                        accept="image/*,.heic"
                                        onChange={handleCoverPhotoFileSelect}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() =>
                                            !uploadingCoverPhoto &&
                                            coverPhotoInputRef.current?.click()
                                        }
                                        className={cn(
                                            'rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors cursor-pointer',
                                            !uploadingCoverPhoto &&
                                                'hover:border-muted-foreground/50',
                                        )}
                                    >
                                        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="mb-2 text-sm font-medium">
                                            Sube la foto de portada
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Formatos: PNG, JPG, GIF, HEIC, WEBP
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Tamaño recomendado: 1920x600px (landscape)
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 p-4">
                    <p className="text-sm">
                        <strong className="font-semibold">Nota:</strong> Las
                        imágenes HEIC se convierten automáticamente a JPG. Los
                        videos grandes (+50MB) se comprimen automáticamente
                        para optimizar la carga.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}

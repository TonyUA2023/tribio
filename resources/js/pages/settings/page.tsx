import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import {
    Image as ImageIcon,
    Loader2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

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
    loadingScreen: LoadingScreen | null;
    profileLogo: ProfileLogo | null;
    coverPhoto: CoverPhoto | null;
}

export default function PageSettings({
    loadingScreen,
    profileLogo,
    coverPhoto,
}: PageSettingsProps) {
    const [loadingScreenLogo, setLoadingScreenLogo] =
        useState<LoadingScreen | null>(loadingScreen);
    const [profileLogoImg, setProfileLogoImg] =
        useState<ProfileLogo | null>(profileLogo);
    const [coverPhotoImg, setCoverPhotoImg] =
        useState<CoverPhoto | null>(coverPhoto);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingProfileLogo, setUploadingProfileLogo] = useState(false);
    const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [profileLogoPreview, setProfileLogoPreview] = useState<string | null>(null);
    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [selectedProfileLogoFile, setSelectedProfileLogoFile] = useState<File | null>(null);
    const [selectedCoverPhotoFile, setSelectedCoverPhotoFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const profileLogoInputRef = useRef<HTMLInputElement>(null);
    const coverPhotoInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleLogoFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedLogoFile(file);
        setUploadError(null);

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

    const handleDeleteLogo = () => {
        if (!loadingScreenLogo) return;

        router.delete(`/settings/page/media/${loadingScreenLogo.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setLoadingScreenLogo(null);
                toast.success('Logo eliminado correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar el logo');
            },
        });
    };

    const handleDeleteProfileLogo = () => {
        if (!profileLogoImg) return;

        router.delete(`/settings/page/media/${profileLogoImg.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setProfileLogoImg(null);
                toast.success('Logo de perfil eliminado correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar el logo de perfil');
            },
        });
    };

    const handleDeleteCoverPhoto = () => {
        if (!coverPhotoImg) return;

        router.delete(`/settings/page/media/${coverPhotoImg.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setCoverPhotoImg(null);
                toast.success('Foto de portada eliminada correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar la foto de portada');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Página" />

            <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6 py-4 sm:py-8 px-3 sm:px-6 pb-24 sm:pb-8">
                <div className="px-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                        Configuración de Página
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                        Personaliza el contenido visual de tu página
                    </p>
                </div>

                <div className="space-y-4 sm:space-y-6 rounded-lg border bg-card p-3 sm:p-4 md:p-6 shadow-sm">
                    <HeadingSmall
                        title="Pantalla de Carga"
                        description="Personaliza la pantalla que ven tus clientes mientras carga tu página"
                    />

                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-xs sm:text-sm">Logo de Carga</Label>

                            {loadingScreenLogo && !logoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={loadingScreenLogo.url}
                                        alt="Loading screen logo"
                                        className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg border object-contain bg-muted p-2"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -right-1 sm:-right-2 -top-1 sm:-top-2 h-6 w-6 sm:h-8 sm:w-8"
                                        onClick={handleDeleteLogo}
                                    >
                                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            ) : logoPreview ? (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="rounded-lg border bg-muted p-3 sm:p-4">
                                        <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium">
                                            Vista Previa del Logo
                                        </p>
                                        <div className="flex justify-center">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg border bg-background object-contain p-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={confirmLogoUpload}
                                            disabled={uploadingLogo}
                                            className="flex-1 text-xs sm:text-sm"
                                            size="sm"
                                        >
                                            {uploadingLogo ? (
                                                <>
                                                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                    Subir Logo
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelLogoUpload}
                                            disabled={uploadingLogo}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs sm:text-sm"
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
                                            'rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 sm:p-6 md:p-8 text-center transition-colors cursor-pointer',
                                            !uploadingLogo &&
                                                'hover:border-muted-foreground/50',
                                        )}
                                    >
                                        <Upload className="mx-auto mb-2 sm:mb-3 md:mb-4 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
                                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium px-2">
                                            Sube tu logo personalizado
                                        </p>
                                        <p className="text-xs text-muted-foreground px-2">
                                            PNG, JPG, GIF, HEIC, WEBP
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground px-2">
                                            Recomendado: 200x200px
                                        </p>
                                    </div>
                                </>
                            )}

                            {uploadError && (
                                <div className="rounded-lg border border-destructive bg-destructive/10 p-2 sm:p-3">
                                    <p className="text-xs sm:text-sm text-destructive">{uploadError}</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg bg-muted p-3 sm:p-4">
                            <p className="text-xs sm:text-sm font-medium">
                                Vista Previa de Pantalla de Carga
                            </p>
                            <div className="mt-3 sm:mt-4 flex min-h-[150px] sm:min-h-[200px] items-center justify-center rounded-lg border bg-background">
                                <div className="text-center">
                                    {loadingScreenLogo ? (
                                        <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center">
                                            <img
                                                src={loadingScreenLogo.url}
                                                alt="Loading"
                                                className="h-full w-full object-contain animate-pulse"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                                            <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                        </div>
                                    )}
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Cargando...
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground px-1">
                                {loadingScreenLogo
                                    ? 'Vista previa de tu pantalla de carga personalizada.'
                                    : 'Vista previa de la pantalla de carga por defecto.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6 rounded-lg border bg-card p-3 sm:p-4 md:p-6 shadow-sm">
                    <HeadingSmall
                        title="Logo del Perfil"
                        description="Sube el logo circular que aparecerá en tu mini-página"
                    />

                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-xs sm:text-sm">Logo Circular</Label>

                            {profileLogoImg && !profileLogoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={profileLogoImg.url}
                                        alt="Profile logo"
                                        className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border object-cover bg-muted p-2"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -right-1 sm:-right-2 -top-1 sm:-top-2 h-6 w-6 sm:h-8 sm:w-8"
                                        onClick={handleDeleteProfileLogo}
                                    >
                                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            ) : profileLogoPreview ? (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="rounded-lg border bg-muted p-3 sm:p-4">
                                        <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium">
                                            Vista Previa del Logo
                                        </p>
                                        <div className="flex justify-center">
                                            <img
                                                src={profileLogoPreview}
                                                alt="Profile logo preview"
                                                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border bg-background object-cover p-2"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={confirmProfileLogoUpload}
                                            disabled={uploadingProfileLogo}
                                            className="flex-1 text-xs sm:text-sm"
                                            size="sm"
                                        >
                                            {uploadingProfileLogo ? (
                                                <>
                                                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                    Subir Logo
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelProfileLogoUpload}
                                            disabled={uploadingProfileLogo}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs sm:text-sm"
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
                                            'rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 sm:p-6 md:p-8 text-center transition-colors cursor-pointer',
                                            !uploadingProfileLogo &&
                                                'hover:border-muted-foreground/50',
                                        )}
                                    >
                                        <ImageIcon className="mx-auto mb-2 sm:mb-3 md:mb-4 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
                                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium px-2">
                                            Sube el logo de tu perfil
                                        </p>
                                        <p className="text-xs text-muted-foreground px-2">
                                            PNG, JPG, GIF, HEIC, WEBP
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground px-2">
                                            Recomendado: 200x200px (circular)
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6 rounded-lg border bg-card p-3 sm:p-4 md:p-6 shadow-sm">
                    <HeadingSmall
                        title="Foto de Portada"
                        description="Sube la imagen de fondo/header que aparecerá en la parte superior de tu mini-página"
                    />

                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-xs sm:text-sm">Imagen de Portada</Label>

                            {coverPhotoImg && !coverPhotoPreview ? (
                                <div className="relative w-full">
                                    <img
                                        src={coverPhotoImg.url}
                                        alt="Cover photo"
                                        className="h-32 sm:h-40 md:h-48 w-full rounded-lg border object-cover bg-muted"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -right-1 sm:-right-2 -top-1 sm:-top-2 h-6 w-6 sm:h-8 sm:w-8"
                                        onClick={handleDeleteCoverPhoto}
                                    >
                                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            ) : coverPhotoPreview ? (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="rounded-lg border bg-muted p-3 sm:p-4">
                                        <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium">
                                            Vista Previa de la Portada
                                        </p>
                                        <div className="w-full">
                                            <img
                                                src={coverPhotoPreview}
                                                alt="Cover photo preview"
                                                className="h-32 sm:h-40 md:h-48 w-full rounded-lg border bg-background object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={confirmCoverPhotoUpload}
                                            disabled={uploadingCoverPhoto}
                                            className="flex-1 text-xs sm:text-sm"
                                            size="sm"
                                        >
                                            {uploadingCoverPhoto ? (
                                                <>
                                                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                    Subir Portada
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelCoverPhotoUpload}
                                            disabled={uploadingCoverPhoto}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs sm:text-sm"
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
                                            'rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 sm:p-6 md:p-8 text-center transition-colors cursor-pointer',
                                            !uploadingCoverPhoto &&
                                                'hover:border-muted-foreground/50',
                                        )}
                                    >
                                        <ImageIcon className="mx-auto mb-2 sm:mb-3 md:mb-4 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
                                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium px-2">
                                            Sube la foto de portada
                                        </p>
                                        <p className="text-xs text-muted-foreground px-2">
                                            PNG, JPG, GIF, HEIC, WEBP
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground px-2">
                                            Recomendado: 1920x600px
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm">
                        <strong className="font-semibold">Nota:</strong> Las
                        imágenes HEIC se convierten automáticamente a JPG para
                        optimizar la carga.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}

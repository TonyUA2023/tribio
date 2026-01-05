import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Profile {
    id: number;
    name: string;
    title: string;
    slug: string;
    notification_email: string;
    data: {
        bio?: string;
        phone?: string;
        address?: string;
        hours?: string;
        services?: string[];
        primaryColor?: string;
        secondaryColor?: string;
    };
    gallery?: Array<{
        id: number;
        url: string;
        type: string;
        caption?: string;
    }>;
    logo?: {
        url: string;
    };
    cover?: {
        url: string;
    };
    loading_screen?: {
        url: string;
    };
}

interface Account {
    id: number;
    name: string;
    slug: string;
    type: string;
}

interface SEO {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
}

interface Props {
    account: Account;
    profile: Profile;
    seo?: SEO;
}

export default function Standard({ account, profile, seo }: Props) {
    const [showLoading, setShowLoading] = useState(!!profile.loading_screen);
    const primaryColor = profile.data?.primaryColor || '#1e40af';
    const secondaryColor = profile.data?.secondaryColor || '#3b82f6';

    useEffect(() => {
        if (showLoading) {
            const timer = setTimeout(() => setShowLoading(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showLoading]);

    if (showLoading && profile.loading_screen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black">
                <img
                    src={profile.loading_screen.url}
                    alt="Loading"
                    className="max-w-md animate-pulse"
                />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{seo?.title || profile.name}</title>
                <meta name="description" content={seo?.description || profile.data?.bio || ''} />
                {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
                {seo?.image && <meta property="og:image" content={seo.image} />}
                {seo?.url && <meta property="og:url" content={seo.url} />}
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Cover Photo */}
                {profile.cover && (
                    <div className="relative h-64 w-full">
                        <img
                            src={profile.cover.url}
                            alt="Cover"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                    </div>
                )}

                {/* Profile Header */}
                <div className="mx-auto max-w-6xl px-4 py-8">
                    <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                        {/* Logo */}
                        {profile.logo && (
                            <div className="mb-4 sm:mb-0 sm:mr-6">
                                <img
                                    src={profile.logo.url}
                                    alt={profile.name}
                                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                                />
                            </div>
                        )}

                        {/* Name and Title */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {profile.name}
                            </h1>
                            {profile.title && (
                                <p className="mt-1 text-lg text-gray-600">
                                    {profile.title}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.data?.bio && (
                        <div className="mt-6 rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-3 text-xl font-semibold text-gray-900">
                                Sobre nosotros
                            </h2>
                            <p className="text-gray-700 whitespace-pre-line">
                                {profile.data.bio}
                            </p>
                        </div>
                    )}

                    {/* Contact Info */}
                    {(profile.data?.phone || profile.data?.address || profile.data?.hours) && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {profile.data.phone && (
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-2 font-semibold text-gray-900">
                                        Teléfono
                                    </h3>
                                    <a
                                        href={`tel:${profile.data.phone}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {profile.data.phone}
                                    </a>
                                </div>
                            )}

                            {profile.data.address && (
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-2 font-semibold text-gray-900">
                                        Dirección
                                    </h3>
                                    <p className="text-gray-700">
                                        {profile.data.address}
                                    </p>
                                </div>
                            )}

                            {profile.data.hours && (
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-2 font-semibold text-gray-900">
                                        Horario
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {profile.data.hours}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Services */}
                    {profile.data?.services && profile.data.services.length > 0 && (
                        <div className="mt-6 rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Servicios
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {profile.data.services.map((service, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center rounded-lg border border-gray-200 p-3"
                                    >
                                        <div
                                            className="mr-3 h-2 w-2 rounded-full"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <span className="text-gray-700">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery */}
                    {profile.gallery && profile.gallery.length > 0 && (
                        <div className="mt-6 rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Galería
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {profile.gallery.map((media) => (
                                    <div key={media.id} className="relative aspect-square overflow-hidden rounded-lg">
                                        {media.type === 'video' ? (
                                            <video
                                                src={media.url}
                                                className="h-full w-full object-cover"
                                                controls
                                            />
                                        ) : (
                                            <img
                                                src={media.url}
                                                alt={media.caption || ''}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        )}
                                        {media.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                                                <p className="text-sm text-white">
                                                    {media.caption}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Placeholder when no content */}
                    {!profile.data?.bio &&
                     !profile.data?.phone &&
                     !profile.data?.address &&
                     (!profile.gallery || profile.gallery.length === 0) && (
                        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                            <div className="mx-auto max-w-md">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">
                                    Perfil en construcción
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Este perfil está siendo configurado. Vuelve pronto para ver más información.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-12 border-t border-gray-200 bg-white py-8">
                    <div className="mx-auto max-w-6xl px-4 text-center">
                        <p className="text-sm text-gray-500">
                            Creado con{' '}
                            <a
                                href="https://tribio.info"
                                className="font-medium text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                TRIBIO
                            </a>
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

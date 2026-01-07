import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaClock,
  FaStar,
  FaCut,
  FaArrowRight,
  FaFacebook,
} from 'react-icons/fa';

// Componentes
import { BookingWidget } from '@/components/booking/BookingWidget';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StoryCircle } from '@/components/stories/StoryCircle';
import PostGridModal from '@/components/posts/PostGridModal';

/**
 * Configuración de Plantilla Modern Minimal
 */
export interface ModernMinimalConfig {
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;

  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;

  businessName: string;
  businessTitle: string;
  businessBio?: string;

  services: string[];
  schedule?: string;

  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };

  gallery?: CarouselImage[];

  profileId: number;
  accountSlug: string;
}

interface ModernMinimalTemplateProps {
  config: ModernMinimalConfig;
  customizations?: any;
}

const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;
  const cleaned = s.replace(/^uploaded_files\//, '');
  return `/uploaded_files/${cleaned}`;
};

/**
 * Fondo Minimalista con Grid
 */
const MinimalBackground = ({ color, bgColor }: { color: string; bgColor: string }) => (
  <div className="pointer-events-none fixed inset-0 -z-0" style={{ backgroundColor: bgColor }}>
    {/* Grid sutil */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />

    {/* Gradiente radial */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)`,
      }}
    />

    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
    `}</style>
  </div>
);

/**
 * Tarjeta de Servicio Minimalista
 */
const MinimalServiceCard = ({ service, index, color }: { service: string; index: number; color: string }) => (
  <div
    className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm
      hover:bg-white/10 transition-all duration-500 hover:scale-105"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div
      className="absolute top-0 left-0 w-full h-1 transform origin-left scale-x-0
        group-hover:scale-x-100 transition-transform duration-500"
      style={{ backgroundColor: color }}
    />

    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-gray-200 font-medium text-lg">{service}</span>
        </div>
        <FaArrowRight
          className="transform -translate-x-4 opacity-0 group-hover:translate-x-0
            group-hover:opacity-100 transition-all duration-300"
          style={{ color }}
        />
      </div>
    </div>
  </div>
);

/**
 * Botón Social Minimalista
 */
const MinimalSocialButton = ({
  icon,
  label,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative flex items-center gap-4 p-4 rounded-xl
      bg-white/5 backdrop-blur-sm border border-white/10
      hover:bg-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className="text-2xl transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <div className="flex-1">
      <span className="text-gray-200 font-medium">{label}</span>
    </div>
    <FaArrowRight
      className="transform translate-x-0 opacity-0 group-hover:translate-x-2
        group-hover:opacity-100 transition-all duration-300 text-gray-400"
    />
  </a>
);

export const ModernMinimalTemplate: React.FC<ModernMinimalTemplateProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(() => ({
    ...config,
    ...(customizations || {}),
  }), [config, customizations]);

  const {
    primaryColor,
    backgroundColor,
    accentColor,
    loadingImage,
    coverImage,
    logoImage,
    businessName,
    businessTitle,
    businessBio,
    services,
    schedule,
    socialLinks,
    gallery,
    profileId,
    accountSlug,
  } = finalConfig;

  const [isLoading, setIsLoading] = useState(true);
  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;

  const bookingConfig = {
    profileId,
    businessName,
    services,
    accentColor: primaryColor,
    socialLinks,
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const ogImage = coverImage || logoImage;

  return (
    <>
      {isLoading && (
        <LoadingScreen
          logoUrl={loadingScreenUrl}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1500}
        />
      )}

      <Head title={businessName}>
        <meta name="description" content={businessTitle} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={businessName} />
        <meta property="og:description" content={businessTitle} />
        {ogImage && <meta property="og:image" content={ogImage} />}
      </Head>

      <div className="relative min-h-screen">
        <MinimalBackground color={primaryColor} bgColor={backgroundColor} />

        {/* Header Minimalista */}
        <div className="relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12">
            <div className="text-center space-y-6">
              {logoImage && (
                <div className="inline-block">
                  <div className="relative group">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10">
                      <img
                        src={resolveMediaUrl(logoImage)}
                        alt={businessName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
                  {businessName}
                </h1>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                </div>

                <p className="text-xl text-gray-400 font-light">{businessTitle}</p>

                {businessBio && (
                  <p className="text-gray-500 max-w-2xl mx-auto mt-4">{businessBio}</p>
                )}
              </div>
            </div>
          </div>

          {coverImage && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12">
              <div className="relative rounded-3xl overflow-hidden h-96">
                <img
                  src={resolveMediaUrl(coverImage)}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-4 sm:px-6 pb-20 max-w-5xl mx-auto mt-16">
          <div className="space-y-16">
            {/* Stories */}
            <ScrollReveal>
              <StoryCircle profileId={profileId} accentColor={primaryColor} />
            </ScrollReveal>

            {/* Servicios */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <h2 className="text-4xl font-bold text-white">Servicios</h2>
                </div>

                <div className="space-y-3">
                  {services.map((service, i) => (
                    <MinimalServiceCard
                      key={i}
                      service={service}
                      index={i}
                      color={accentColor}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Posts */}
            <ScrollReveal delay={0.2}>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <h2 className="text-4xl font-bold text-white">Publicaciones</h2>
                </div>
                <div className="rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                  <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
                </div>
              </div>
            </ScrollReveal>

            {/* Galería */}
            {gallery && gallery.length > 0 && (
              <ScrollReveal delay={0.3}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <h2 className="text-4xl font-bold text-white">Galería</h2>
                  </div>
                  <PremiumCarousel images={gallery} accentColor={primaryColor} />
                </div>
              </ScrollReveal>
            )}

            {/* Horario */}
            {schedule && (
              <ScrollReveal delay={0.4}>
                <div className="rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8">
                  <div className="flex items-center gap-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <FaClock className="text-3xl" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Horario</h3>
                      <p className="text-gray-400">{schedule}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Redes Sociales */}
            <ScrollReveal delay={0.5}>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <h2 className="text-4xl font-bold text-white">Síguenos</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {socialLinks.whatsapp && (
                    <MinimalSocialButton
                      icon={<FaWhatsapp style={{ color: '#25D366' }} />}
                      label="WhatsApp"
                      href={socialLinks.whatsapp}
                      color={primaryColor}
                    />
                  )}
                  {socialLinks.instagram && (
                    <MinimalSocialButton
                      icon={<FaInstagram style={{ color: '#E4405F' }} />}
                      label="Instagram"
                      href={socialLinks.instagram}
                      color={primaryColor}
                    />
                  )}
                  {socialLinks.facebook && (
                    <MinimalSocialButton
                      icon={<FaFacebook style={{ color: '#1877F2' }} />}
                      label="Facebook"
                      href={socialLinks.facebook}
                      color={primaryColor}
                    />
                  )}
                  {socialLinks.tiktok && (
                    <MinimalSocialButton
                      icon={<FaTiktok className="text-white" />}
                      label="TikTok"
                      href={socialLinks.tiktok}
                      color={primaryColor}
                    />
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Reseñas */}
            <ScrollReveal delay={0.6}>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <h2 className="text-4xl font-bold text-white">Reseñas</h2>
                </div>
                <div className="rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                  <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                  <div className="mt-6">
                    <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <BookingWidget {...bookingConfig} />
      </div>
    </>
  );
};

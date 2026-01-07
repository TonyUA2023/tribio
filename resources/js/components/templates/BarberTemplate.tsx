import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaClock,
  FaStar,
  FaCut,
  FaCrown,
  FaChevronRight,
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
 * Configuración de Plantilla
 */
export interface TemplateConfig {
  // Colores y estilos
  primaryColor: string;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;

  // Imágenes
  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;

  // Información del negocio
  businessName: string;
  businessTitle: string;
  businessBio?: string;

  // Servicios
  services: string[];

  // Horario
  schedule?: string;

  // Redes sociales
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };

  // Galería
  gallery?: CarouselImage[];

  // IDs para funcionalidades
  profileId: number;
  accountSlug: string;
}

interface BarberTemplateProps {
  config: TemplateConfig;
  customizations?: any; // Personalizaciones del usuario
}

/**
 * Normaliza URLs de medios
 */
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
 * Fondo Animado Barbería
 */
const BarberBackground = ({ color, bgColor }: { color: string; bgColor: string }) => (
  <div className="pointer-events-none fixed inset-0 -z-0" style={{ backgroundColor: bgColor }}>
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 40px,
          ${color} 40px,
          ${color} 80px
        )`,
        backgroundSize: '200% 200%',
        animation: 'barberScroll 60s linear infinite',
      }}
    />
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
      }}
    />
    <style>{`
      @keyframes barberScroll {
        0% { background-position: 0 0; }
        100% { background-position: 80px 80px; }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-up { animation: fadeUp 0.8s ease-out forwards; opacity: 0; }
      .delay-100 { animation-delay: 0.1s; }
      .delay-200 { animation-delay: 0.2s; }
      .delay-300 { animation-delay: 0.3s; }
    `}</style>
  </div>
);

/**
 * Botón Social Premium
 */
const PremiumSocialButton = ({
  icon,
  title,
  subtitle,
  href,
  brandColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
  brandColor: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative flex items-center gap-4 p-4 rounded-xl overflow-hidden
      bg-white/5 border border-white/5 backdrop-blur-md
      hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
  >
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${brandColor}`}
    />
    <div
      className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center
      bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg
      group-hover:scale-110 transition-transform duration-300"
    >
      <div className="text-gray-300 group-hover:text-white transition-colors">
        {icon}
      </div>
    </div>

    <div className="relative z-10 flex flex-col flex-1">
      <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold group-hover:text-gray-300 transition-colors">
        {subtitle}
      </span>
      <span className="text-gray-100 font-bold text-base leading-tight group-hover:text-amber-400 transition-colors">
        {title}
      </span>
    </div>

    <div className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <FaChevronRight className="text-white/50" />
    </div>
  </a>
);

export const BarberTemplate: React.FC<BarberTemplateProps> = ({ config, customizations }) => {
  // Merge config con customizations
  const finalConfig = useMemo(() => ({
    ...config,
    ...(customizations || {}),
  }), [config, customizations]);

  const {
    primaryColor,
    backgroundColor,
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

  // Loading Screen State
  const [isLoading, setIsLoading] = useState(true);
  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;

  // Parallax
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Widget booking config
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
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen
          logoUrl={loadingScreenUrl}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1500}
        />
      )}

      <Head title={businessName}>
        <meta name="description" content={businessTitle} />
        <meta name="keywords" content="TRIBIO, reservas online, barbería" />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={businessName} />
        <meta property="og:description" content={businessTitle} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="TRIBIO" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={businessName} />
        <meta name="twitter:description" content={businessTitle} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Head>

      <div className="relative min-h-screen">
        <BarberBackground color={primaryColor} bgColor={backgroundColor} />

        {/* Header con Cover y Logo */}
        <div className="relative w-full">
          {coverImage && (
            <div className="h-48 sm:h-64 overflow-hidden">
              <div
                className="h-full bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: `url(${resolveMediaUrl(coverImage)})`,
                  transform: `translateY(${y}px)`,
                }}
              />
            </div>
          )}

          <div className="relative px-4 sm:px-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center -mt-16 sm:-mt-20">
              {logoImage && (
                <div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 shadow-2xl bg-black overflow-hidden"
                  style={{ borderColor: primaryColor }}
                >
                  <img
                    src={resolveMediaUrl(logoImage)}
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-center mt-4 space-y-2">
                <h1
                  className="text-3xl sm:text-4xl font-black tracking-tight"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #fcd34d 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {businessName}
                </h1>
                <p className="text-gray-400 text-sm sm:text-base font-medium">
                  {businessTitle}
                </p>
                {businessBio && (
                  <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mt-2">
                    {businessBio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
          <div className="mt-8 space-y-8">
            {/* Stories */}
            <ScrollReveal>
              <StoryCircle profileId={profileId} accentColor={primaryColor} />
            </ScrollReveal>

            {/* Posts Feed */}
            <ScrollReveal delay={0.1}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, #fcd34d)`,
                    }}
                  >
                    <FaCut className="text-black text-lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-100">Publicaciones</h2>
                </div>
                <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
              </div>
            </ScrollReveal>

            {/* Galería */}
            {gallery && gallery.length > 0 && (
              <ScrollReveal delay={0.2}>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, #fcd34d)`,
                      }}
                    >
                      <FaCrown className="text-black text-lg" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-100">Nuestros Trabajos</h2>
                  </div>
                  <PremiumCarousel images={gallery} accentColor={primaryColor} />
                </div>
              </ScrollReveal>
            )}

            {/* Servicios */}
            <ScrollReveal delay={0.3}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, #fcd34d)`,
                    }}
                  >
                    <FaCut className="text-black text-lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-100">Servicios</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((service, i) => (
                    <div
                      key={i}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center
                        hover:border-white/20 transition-all duration-300 group"
                    >
                      <FaCut className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-amber-400 transition-colors" />
                      <span className="text-gray-200 font-medium text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Horario */}
            {schedule && (
              <ScrollReveal delay={0.4}>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-2xl" style={{ color: primaryColor }} />
                    <div>
                      <h3 className="text-gray-100 font-bold text-lg">Horario de Atención</h3>
                      <p className="text-gray-400 text-sm">{schedule}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Redes Sociales */}
            <ScrollReveal delay={0.5}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
                  Síguenos
                </h2>
                <div className="space-y-3">
                  {socialLinks.whatsapp && (
                    <PremiumSocialButton
                      icon={<FaWhatsapp size={24} />}
                      title="WhatsApp"
                      subtitle="Contáctanos"
                      href={socialLinks.whatsapp}
                      brandColor="from-green-500 to-green-600"
                    />
                  )}
                  {socialLinks.instagram && (
                    <PremiumSocialButton
                      icon={<FaInstagram size={24} />}
                      title="Instagram"
                      subtitle="Síguenos"
                      href={socialLinks.instagram}
                      brandColor="from-pink-500 to-purple-600"
                    />
                  )}
                  {socialLinks.tiktok && (
                    <PremiumSocialButton
                      icon={<FaTiktok size={24} />}
                      title="TikTok"
                      subtitle="Síguenos"
                      href={socialLinks.tiktok}
                      brandColor="from-black to-gray-800"
                    />
                  )}
                  {socialLinks.facebook && (
                    <PremiumSocialButton
                      icon={<FaFacebook size={24} />}
                      title="Facebook"
                      subtitle="Síguenos"
                      href={socialLinks.facebook}
                      brandColor="from-blue-500 to-blue-700"
                    />
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Reseñas */}
            <ScrollReveal delay={0.6}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, #fcd34d)`,
                    }}
                  >
                    <FaStar className="text-black text-lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-100">Reseñas</h2>
                </div>
                <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                <div className="mt-6">
                  <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Booking Widget */}
        <BookingWidget {...bookingConfig} />
      </div>
    </>
  );
};

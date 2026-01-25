import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaClock,
  FaStar,
  FaCut,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
} from 'react-icons/fa';
import { GiRazor } from 'react-icons/gi';

// Componentes
import { BookingWidget } from '@/components/booking/BookingWidget';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { normalizeSocialLinks } from '@/utils/socialLinks';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StoryCircle } from '@/components/stories/StoryCircle';
import PostGridModal from '@/components/posts/PostGridModal';
import { ShareButton } from '@/components/ShareButton';

/**
 * Configuración de Plantilla Classic Barber
 */
export interface ClassicBarberConfig {
  primaryColor: string;
  backgroundColor: string;
  secondaryColor: string;

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

interface ClassicBarberTemplateProps {
  config: ClassicBarberConfig;
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
 * Fondo Vintage con patrón de rayas de barbería
 */
const VintageBarberBackground = ({ primaryColor, bgColor }: { primaryColor: string; bgColor: string }) => (
  <div className="pointer-events-none fixed inset-0 -z-0" style={{ backgroundColor: bgColor }}>
    {/* Patrón de rayas clásicas de barbería */}
    <div
      className="absolute top-0 left-0 w-full h-32 opacity-10"
      style={{
        background: `repeating-linear-gradient(
          -45deg,
          ${primaryColor},
          ${primaryColor} 20px,
          transparent 20px,
          transparent 40px
        )`
      }}
    />

    {/* Textura de papel vintage */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />

    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>
  </div>
);

/**
 * Tarjeta de Servicio Vintage
 */
const VintageServiceCard = ({ service, icon, color }: { service: string; icon: React.ReactNode; color: string }) => (
  <div className="relative group">
    <div
      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"
      style={{ backgroundColor: color }}
    />
    <div className="relative bg-black/40 backdrop-blur-sm border-2 rounded-lg p-6 text-center
      hover:border-opacity-100 transition-all duration-300 transform hover:-translate-y-1"
      style={{ borderColor: color }}
    >
      <div className="flex justify-center mb-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center border-2"
          style={{ borderColor: color, backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
        {service}
      </h3>
      <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: color }} />
    </div>
  </div>
);

export const ClassicBarberTemplate: React.FC<ClassicBarberTemplateProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(() => ({
    ...config,
    ...(customizations || {}),
  }), [config, customizations]);

  const {
    primaryColor = '#dc2626',
    backgroundColor = '#0a0a0a',
    secondaryColor = '#d4af37',
    loadingImage,
    coverImage,
    logoImage,
    businessName = 'Mi Negocio',
    businessTitle = 'Bienvenido',
    businessBio = '',
    services = [],
    schedule = '',
    socialLinks = {},
    gallery = [],
    profileId,
    accountSlug,
  } = finalConfig;

  // Normalize social links
  const normalizedLinks = useMemo(() => normalizeSocialLinks(socialLinks), [socialLinks]);

  const [isLoading, setIsLoading] = useState(true);
  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;

  const bookingConfig = {
    profileId,
    businessName,
    services,
    accentColor: primaryColor,
    socialLinks,
    language: 'es' as const,
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
        <VintageBarberBackground primaryColor={primaryColor} bgColor={backgroundColor} />

        {/* Header Clásico */}
        <div className="relative">
          {coverImage && (
            <div className="h-64 sm:h-80 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${resolveMediaUrl(coverImage)})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

              {/* Stripes overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 50px,
                    ${primaryColor} 50px,
                    ${primaryColor} 53px
                  )`
                }}
              />
            </div>
          )}

          <div className="relative px-4 sm:px-6 max-w-6xl mx-auto -mt-24">
            <div className="flex flex-col items-center">
              {logoImage && (
                <div className="relative">
                  <div
                    className="absolute -inset-2 rounded-full blur-lg opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 shadow-2xl bg-black overflow-hidden"
                    style={{ borderColor: primaryColor }}
                  >
                    <img
                      src={resolveMediaUrl(logoImage)}
                      alt={businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="text-center mt-6 space-y-3">
                <h1
                  className="text-4xl sm:text-5xl font-black uppercase tracking-wider"
                  style={{
                    color: primaryColor,
                    fontFamily: 'serif',
                    textShadow: `0 0 20px ${primaryColor}40`,
                  }}
                >
                  {businessName}
                </h1>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-16" style={{ backgroundColor: primaryColor }} />
                  <GiRazor className="text-2xl" style={{ color: secondaryColor }} />
                  <div className="h-px w-16" style={{ backgroundColor: primaryColor }} />
                </div>

                <p className="text-gray-300 text-lg font-semibold uppercase tracking-widest">
                  {businessTitle}
                </p>

                {businessBio && (
                  <p className="text-gray-400 text-sm max-w-2xl mx-auto italic">
                    "{businessBio}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-4 sm:px-6 pb-20 max-w-6xl mx-auto mt-12">
          <div className="space-y-12">
            {/* Stories */}
            <ScrollReveal>
              <StoryCircle profileId={profileId} accentColor={primaryColor} />
            </ScrollReveal>

            {/* Servicios Principales */}
            <ScrollReveal delay={0.1}>
              <div className="text-center mb-8">
                <h2
                  className="text-3xl sm:text-4xl font-black uppercase tracking-wider mb-3"
                  style={{ color: primaryColor, fontFamily: 'serif' }}
                >
                  Nuestros Servicios
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-24" style={{ backgroundColor: primaryColor }} />
                  <FaScissors style={{ color: secondaryColor }} />
                  <div className="h-px w-24" style={{ backgroundColor: primaryColor }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, i) => (
                  <VintageServiceCard
                    key={i}
                    service={service}
                    icon={<FaCut className="w-8 h-8" />}
                    color={primaryColor}
                  />
                ))}
              </div>
            </ScrollReveal>

            {/* Posts */}
            <ScrollReveal delay={0.2}>
              <div className="bg-black/30 backdrop-blur-sm border-2 rounded-lg p-6"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaCut className="text-3xl" style={{ color: primaryColor }} />
                  <h2
                    className="text-3xl font-black uppercase tracking-wider"
                    style={{ color: primaryColor, fontFamily: 'serif' }}
                  >
                    Publicaciones
                  </h2>
                </div>
                <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
              </div>
            </ScrollReveal>

            {/* Galería */}
            {gallery && gallery.length > 0 && (
              <ScrollReveal delay={0.3}>
                <div className="bg-black/30 backdrop-blur-sm border-2 rounded-lg p-6"
                  style={{ borderColor: primaryColor }}
                >
                  <div className="text-center mb-6">
                    <h2
                      className="text-3xl font-black uppercase tracking-wider"
                      style={{ color: primaryColor, fontFamily: 'serif' }}
                    >
                      Galería
                    </h2>
                  </div>
                  <PremiumCarousel images={gallery} accentColor={primaryColor} />
                </div>
              </ScrollReveal>
            )}

            {/* Horario */}
            {schedule && (
              <ScrollReveal delay={0.4}>
                <div className="bg-black/30 backdrop-blur-sm border-2 rounded-lg p-8 text-center"
                  style={{ borderColor: primaryColor }}
                >
                  <FaClock className="w-12 h-12 mx-auto mb-4" style={{ color: secondaryColor }} />
                  <h3
                    className="text-2xl font-black uppercase tracking-wider mb-3"
                    style={{ color: primaryColor, fontFamily: 'serif' }}
                  >
                    Horario de Atención
                  </h3>
                  <p className="text-gray-300 text-lg font-semibold">{schedule}</p>
                </div>
              </ScrollReveal>
            )}

            {/* Redes Sociales */}
            <ScrollReveal delay={0.5}>
              <div className="bg-black/30 backdrop-blur-sm border-2 rounded-lg p-8"
                style={{ borderColor: primaryColor }}
              >
                <h2
                  className="text-3xl font-black uppercase tracking-wider text-center mb-8"
                  style={{ color: primaryColor, fontFamily: 'serif' }}
                >
                  Encuéntranos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {normalizedLinks.whatsapp && (
                    <a
                      href={normalizedLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-black/40 border-2 hover:bg-black/60 transition-all"
                      style={{ borderColor: primaryColor }}
                    >
                      <FaWhatsapp className="text-3xl" style={{ color: '#25D366' }} />
                      <span className="text-white font-bold">WhatsApp</span>
                    </a>
                  )}
                  {normalizedLinks.instagram && (
                    <a
                      href={normalizedLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-black/40 border-2 hover:bg-black/60 transition-all"
                      style={{ borderColor: primaryColor }}
                    >
                      <FaInstagram className="text-3xl" style={{ color: '#E4405F' }} />
                      <span className="text-white font-bold">Instagram</span>
                    </a>
                  )}
                  {normalizedLinks.facebook && (
                    <a
                      href={normalizedLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-black/40 border-2 hover:bg-black/60 transition-all"
                      style={{ borderColor: primaryColor }}
                    >
                      <FaFacebook className="text-3xl" style={{ color: '#1877F2' }} />
                      <span className="text-white font-bold">Facebook</span>
                    </a>
                  )}
                  {normalizedLinks.tiktok && (
                    <a
                      href={normalizedLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg bg-black/40 border-2 hover:bg-black/60 transition-all"
                      style={{ borderColor: primaryColor }}
                    >
                      <FaTiktok className="text-3xl text-white" />
                      <span className="text-white font-bold">TikTok</span>
                    </a>
                  )}
                  <div
                    className="flex items-center gap-3 p-4 rounded-lg bg-black/40 border-2 hover:bg-black/60 transition-all cursor-pointer col-span-2"
                    style={{ borderColor: primaryColor }}
                  >
                    <ShareButton
                      url={window.location.href}
                      title={businessName}
                      text={businessBio || `Conoce ${businessName}`}
                      iconSize={24}
                      color="#9CA3AF"
                    />
                    <span className="text-white font-bold">Compartir</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Reseñas */}
            <ScrollReveal delay={0.6}>
              <div className="bg-black/30 backdrop-blur-sm border-2 rounded-lg p-6"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FaStar className="text-3xl" style={{ color: secondaryColor }} />
                  <h2
                    className="text-3xl font-black uppercase tracking-wider"
                    style={{ color: primaryColor, fontFamily: 'serif' }}
                  >
                    Reseñas
                  </h2>
                </div>
                <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                <div className="mt-6">
                  <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Booking Widget - Fixed at bottom */}
        <div className="fixed bottom-6 left-4 right-4 z-50 md:absolute md:bottom-6 md:w-[calc(100%-32px)]">
          <BookingWidget
            config={bookingConfig}
            className="shadow-2xl shadow-black ring-1 ring-white/10"
          />
        </div>
      </div>
    </>
  );
};

export default ClassicBarberTemplate;

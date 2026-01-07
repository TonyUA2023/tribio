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
  FaArrowRight,
} from 'react-icons/fa';

// --- COMPONENTES IMPORTADOS ---
import { BookingWidget } from '@/components/booking/BookingWidget';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StoryCircle } from '@/components/stories/StoryCircle';
import PostGridModal from '@/components/posts/PostGridModal';

// --- INTERFACES (MANTENIDAS) ---
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
  businessCategory?: string;
  showRating?: boolean;
  rating?: number;
  showVIP?: boolean;
  isPremium?: boolean;
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

// --- UTILIDADES ---
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;
  const cleaned = s.replace(/^uploaded_files\//, '');
  return `/uploaded_files/${cleaned}`;
};

// --- COMPONENTES VISUALES INTERNOS (DEL REFERENTE) ---

/**
 * Fondo Animado Barbería (Copiado del referente)
 */
const BarberBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-0 bg-slate-950">
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 40px,
        #fbbf24 40px,
        #fbbf24 80px
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
 * Botón Social Premium (Copiado del referente)
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
      hover:border-white/10 transition-all duration-500 hover:-translate-y-1 active:scale-95"
  >
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${brandColor}`}
    />
    <div
      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center
      bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg
      group-hover:scale-110 transition-transform duration-300`}
    >
      <div className="text-gray-300 group-hover:text-white transition-colors">
        {icon}
      </div>
    </div>

    <div className="relative z-10 flex flex-col flex-1 text-left">
      <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold group-hover:text-gray-300 transition-colors">
        {subtitle}
      </span>
      <span className="text-gray-100 font-bold text-base leading-tight group-hover:text-amber-400 transition-colors truncate">
        {title}
      </span>
    </div>

    <div className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <FaChevronRight className="text-white/50" />
    </div>
  </a>
);

// --- COMPONENTE PRINCIPAL ---
export const ModernMinimalTemplate: React.FC<ModernMinimalTemplateProps> = ({ config, customizations }) => {
  // 1. Mapeo de Variables: Configuración (Input) -> Estructura (Uso)
  const finalConfig = useMemo(() => ({
    ...config,
    ...(customizations || {}),
  }), [config, customizations]);

  const {
    primaryColor = '#eab308',
    loadingImage,
    coverImage,
    logoImage,
    businessName,
    businessTitle,
    businessBio,
    showRating = true,
    rating = 5.0,
    showVIP = true,
    isPremium = false,
    services = [],
    schedule,
    socialLinks = {},
    gallery = [],
    profileId,
    accountSlug,
    accentColor
  } = finalConfig;

  // Estados y Hooks visuales
  const [isLoading, setIsLoading] = useState(true);
  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;

  // Parallax Effect (Del referente)
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Configuración del Booking Widget
  const bookingConfig = {
    profileId,
    businessName,
    services,
    accentColor: primaryColor,
    socialLinks,
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const primaryGold = primaryColor || '#fbbf24'; // Fallback al dorado si falla el color

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
        {/* Viewport esencial para el diseño móvil */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#020617" />
      </Head>

      {/* === CONTENEDOR MAESTRO (Simulación de Dispositivo) === 
         Aquí está la magia de la responsividad que pediste.
         En Desktop: Centra y limita el ancho (md:max-w-screen-md).
         En Móvil: Ocupa el 100%.
      */}
      <div className="flex justify-center items-center min-h-screen bg-neutral-950 md:p-10">
        
        <div
          className="relative w-full flex flex-col overflow-hidden bg-slate-950 min-h-screen font-sans text-gray-100
          md:max-w-screen-md md:h-[860px] md:rounded-[40px] md:shadow-2xl md:shadow-black md:mx-auto md:border md:border-white/5 md:overflow-y-auto custom-scrollbar"
        >
          <BarberBackground />

          {/* --- HERO SECTION --- */}
          <header className="relative h-[460px] shrink-0">
            <div className="absolute inset-0 overflow-hidden">
              {resolvedCover ? (
                <img
                  src={resolvedCover}
                  alt="Cover"
                  style={{ transform: `translateY(${y * 0.5}px) scale(1.1)` }}
                  className="w-full h-full object-cover transition-transform duration-75 will-change-transform opacity-70"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}
              {/* Gradientes para integración suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 z-10 text-center">
              {/* Logo / Story Circle */}
              <div className="mb-5 animate-fade-up">
                 <StoryCircle 
                    profileId={profileId} 
                    accentColor={primaryGold} 
                    // Si no hay StoryCircle, usar imagen normal:
                    // logoUrl={resolvedLogo} 
                 />
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 animate-fade-up delay-100 tracking-tight drop-shadow-2xl uppercase leading-none">
                {businessName}
              </h1>

              {/* Separador y Subtítulo */}
              <div className="flex items-center gap-3 animate-fade-up delay-200 mb-4">
                <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-amber-500/50" />
                <p className="text-amber-100/70 text-xs sm:text-sm uppercase tracking-[0.3em] font-medium">
                  {businessTitle}
                </p>
                <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-amber-500/50" />
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3 animate-fade-up delay-300">
                {showRating && (
                  <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <FaStar className="text-amber-400 text-xs" />
                    <span className="text-xs font-bold text-white">{rating.toFixed(1)} Rating</span>
                  </div>
                )}
                {showVIP && (
                  <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <FaCrown className="text-amber-400 text-xs" />
                    <span className="text-xs font-bold text-white">VIP</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* --- MAIN CONTENT --- */}
          <main className="relative z-20 flex-1 px-4 sm:px-6 pb-32 space-y-8 -mt-4">
            
            {/* Bio Card con Pastilla Premium */}
            {businessBio && (
              <ScrollReveal animation="scale">
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl border border-white/5 shadow-2xl">
                  {isPremium && (
                    <div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg"
                      style={{ background: primaryGold, boxShadow: `0 10px 15px -3px ${primaryGold}40` }}
                    >
                      Experiencia Premium
                    </div>
                  )}
                  <p className="text-gray-300 leading-relaxed font-light text-center text-sm sm:text-base mt-2">
                    {businessBio}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* Redes Sociales (Premium Buttons) */}
            <ScrollReveal animation="slide-left">
              <section>
                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2 px-2">
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: primaryGold }} />
                  <span>Síguenos</span>
                </h2>
                <div className="space-y-3">
                  {socialLinks.instagram && (
                    <PremiumSocialButton
                      href={socialLinks.instagram}
                      icon={<FaInstagram size={24} />}
                      title={`@${accountSlug}`}
                      subtitle="Portafolio en Instagram"
                      brandColor="from-purple-600 via-pink-600 to-orange-500"
                    />
                  )}
                  {socialLinks.tiktok && (
                    <PremiumSocialButton
                      href={socialLinks.tiktok}
                      icon={<FaTiktok size={22} />}
                      title={`@${accountSlug}`}
                      subtitle="Tutoriales y Cortes"
                      brandColor="from-cyan-500 via-black to-red-500"
                    />
                  )}
                </div>
              </section>
            </ScrollReveal>

            {/* Posts Grid Modal */}
            <ScrollReveal animation="fade">
               <section>
                  <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2 px-2">
                    <span style={{ color: primaryGold }}>🎬</span>
                    <span>Nuestras <span style={{ color: primaryGold }}>Publicaciones</span></span>
                  </h2>
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <PostGridModal 
                      accountSlug={accountSlug} 
                      accentColor={primaryGold} 
                      ctaButton={{
                        label: 'Agendar',
                        onClick: () => {}, // El BookingWidget maneja esto
                        icon: <FaClock className="w-3 h-3" />
                      }}
                    />
                  </div>
               </section>
            </ScrollReveal>

            {/* Galería (Carousel) */}
            {gallery.length > 0 && (
               <ScrollReveal animation="fade">
                  <section>
                    <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2 px-2">
                      <span style={{ color: primaryGold }}>✨</span>
                      <span>Nuestros <span style={{ color: primaryGold }}>Trabajos</span></span>
                    </h2>
                    <PremiumCarousel 
                      images={gallery} 
                      accentColor={primaryGold} 
                      autoPlay={true} 
                      interval={4000} 
                    />
                  </section>
               </ScrollReveal>
            )}

            {/* Reseñas */}
            <ScrollReveal animation="slide-right">
               <section>
                 <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2 px-2">
                   <FaStar style={{ color: primaryGold }} />
                   <span>Opiniones</span>
                 </h2>
                 <ReviewsList accountSlug={accountSlug} accentColor={primaryGold} />
               </section>
            </ScrollReveal>

            {/* Formulario de Reseñas */}
            <ScrollReveal animation="scale">
              <section>
                <div className="rounded-2xl bg-slate-900/50 p-6 border border-white/5">
                   <ReviewForm accountSlug={accountSlug} accentColor={primaryGold} />
                </div>
              </section>
            </ScrollReveal>

            {/* Horario */}
            {schedule && (
              <ScrollReveal animation="blur">
                <section className="rounded-2xl bg-slate-900/50 p-6 border border-white/5">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ 
                        backgroundColor: `${primaryGold}10`, 
                        color: primaryGold, 
                        borderColor: `${primaryGold}20` 
                      }}
                    >
                      <FaClock size={18} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white text-sm font-bold uppercase tracking-wide">
                        Horario de Atención
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 leading-snug whitespace-pre-line">
                        {schedule}
                      </p>
                    </div>
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Lista de Servicios */}
            {services.length > 0 && (
              <ScrollReveal animation="fade">
                <section>
                  <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-2">
                    <FaCut style={{ color: primaryGold }} />
                    <span style={{ color: `${primaryGold}80` }}>•</span>
                    <span>Servicios Populares</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {services.slice(0, 8).map((service, idx) => (
                      <div
                        key={idx}
                        className="group relative overflow-hidden rounded-xl bg-slate-900 border border-white/5 p-4 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 flex items-center justify-center text-center"
                      >
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <p className="text-gray-400 text-xs sm:text-sm font-medium relative z-10 group-hover:text-amber-100 transition-colors">
                          {service}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}
          </main>

          {/* --- FOOTER FIXED AREAS --- */}
          
          {/* Gradiente inferior para suavizar el scroll final */}
          <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none z-30 md:absolute md:rounded-b-[40px]" />

          {/* Botón Flotante de WhatsApp */}
          {socialLinks.whatsapp && (
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center
              bg-[#25D366] text-white shadow-lg shadow-green-900/50 border-2 border-green-400/30
              hover:scale-110 active:scale-95 transition-all duration-300 
              md:absolute md:bottom-28 md:right-6"
            >
              <FaWhatsapp size={28} />
            </a>
          )}

          {/* Widget de Reserva (Booking) */}
          <div className="fixed bottom-6 left-4 right-4 z-50 md:absolute md:bottom-6 md:w-[calc(100%-32px)]">
            <BookingWidget
              config={bookingConfig}
              className="shadow-2xl shadow-black ring-1 ring-white/10 w-full"
            />
          </div>

        </div>
      </div>
    </>
  );
};

export default ModernMinimalTemplate;
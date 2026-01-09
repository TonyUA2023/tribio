import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaCar,
  FaWhatsapp,
  FaImages,
} from 'react-icons/fa';

// --- COMPONENTES REUTILIZABLES ---
import { BookingWidget } from '@/components/booking/BookingWidget';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ContentButton } from '@/components/content/ContentButton';
import PostGridModal from '@/components/posts/PostGridModal';
import { ScrollReveal } from '@/components/animated/ScrollReveal';

// --- INTERFACES ---
export interface CarWashConfig {
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;
  businessName: string;
  businessTitle?: string;
  businessBio?: string;
  services?: string[];
  schedule?: string;
  address?: string;
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

interface CarWashTemplateProps {
  config: CarWashConfig;
  customizations?: any;
  activeModules?: string[];
}

// --- UTIL ---
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;
  const cleaned = s.replace(/^uploaded_files\//, '');
  return `/uploaded_files/${cleaned}`;
};

export const CarWashTemplate: React.FC<CarWashTemplateProps> = ({
  config,
  customizations,
  activeModules = [],
}) => {
  const finalConfig = useMemo(
    () => ({
      primaryColor: '#0ea5e9',
      backgroundColor: '#020617',
      accentColor: '#fbbf24',
      socialLinks: {},
      ...config,
      ...(customizations || {}),
    }),
    [config, customizations],
  );

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
    services = [],
    schedule,
    address,
    socialLinks = {},
    gallery = [],
    profileId,
    accountSlug,
  } = finalConfig;

  const [isLoading, setIsLoading] = useState(true);

  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;

  const bookingConfig = {
    profileId,
    businessName,
    services,
    accentColor: primaryColor || '#0ea5e9',
    socialLinks,
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        logoUrl={loadingScreenUrl || resolvedLogo || undefined}
        onLoadingComplete={() => setIsLoading(false)}
        minDuration={1200}
      />
    );
  }

  const bg = backgroundColor || '#020617';
  const primary = primaryColor || '#0ea5e9';
  const accent = accentColor || '#fbbf24';

  // Check if booking module is active
  const hasBookingModule = activeModules.includes('booking') || activeModules.includes('bookings');

  const defaultCover =
    resolvedCover ||
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1200&auto=format&fit=crop';

  return (
    <>
      <Head title={businessName || 'Car Detailing'}>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content={bg} />
      </Head>

      <div
        className="min-h-screen w-full flex justify-center bg-slate-950 text-white"
        style={{ background: `radial-gradient(circle at top, #0f172a 0, ${bg} 45%, #000 100%)` }}
      >
        {/* Contenedor central responsivo */}
        <div className="w-full max-w-5xl min-h-screen md:my-6 md:rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(15,23,42,0.9)] bg-gradient-to-b from-slate-950 via-slate-950 to-black">
          {/* === HERO RESPONSIVO (2 columnas en desktop) === */}
          <header className="relative">
            <div className="grid md:grid-cols-2 md:gap-0">
              {/* Imagen de portada */}
              <div className="relative h-[260px] xs:h-[280px] sm:h-[320px] md:h-[380px] overflow-hidden">
                <img
                  src={defaultCover}
                  alt="Car Detailing"
                  className="w-full h-full object-cover scale-110 md:scale-105"
                />
                {/* Capa de degradados */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35)_0,_transparent_55%)]" />
                {/* Aro con ícono de auto (solo desktop) */}
                <div className="hidden md:flex absolute -bottom-10 left-10 w-24 h-24 rounded-full border-2 border-cyan-400/40 bg-black/70 items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.6)]">
                  <FaCar className="text-3xl text-cyan-300" />
                </div>
              </div>

              {/* Info de empresa */}
              <div className="relative flex flex-col justify-center px-6 py-6 md:py-10">
                {/* Avatar/logo flotante en mobile */}
                <div className="md:hidden flex justify-center mb-4 -mt-12">
                  <div className="w-24 h-24 rounded-full bg-black/70 border border-cyan-400/40 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.6)]">
                    {resolvedLogo ? (
                      <img
                        src={resolvedLogo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaCar className="text-3xl text-cyan-300" />
                    )}
                  </div>
                </div>

                <ScrollReveal>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-cyan-300 font-semibold mb-2 text-center md:text-left">
                    Professional Wash & Detailing
                  </p>
                  <h1 className="text-xl md:text-3xl font-black tracking-tight text-center md:text-left">
                    {businessName || 'Car Detailing'}
                  </h1>
                  {businessTitle && (
                    <p className="mt-1 text-[11px] md:text-xs text-cyan-200/80 text-center md:text-left">
                      {businessTitle}
                    </p>
                  )}
                  {businessBio && (
                    <p className="mt-4 text-xs md:text-sm text-slate-300 leading-relaxed text-center md:text-left">
                      {businessBio}
                    </p>
                  )}
                </ScrollReveal>

                {/* Redes sociales */}
                <ScrollReveal>
                  <div className="flex justify-center md:justify-start gap-3 mt-5">
                    {socialLinks.whatsapp && (
                      <a
                        href={`https://wa.me/${socialLinks.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all shadow-md"
                      >
                        <FaWhatsapp size={16} />
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-full bg-pink-500/10 border border-pink-400/40 text-pink-300 hover:bg-pink-500 hover:text-white transition-all shadow-md"
                      >
                        <FaInstagram size={16} />
                      </a>
                    )}
                    {socialLinks.tiktok && (
                      <a
                        href={socialLinks.tiktok}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-full bg-white/5 border border-white/30 text-white hover:bg-white hover:text-black transition-all shadow-md"
                      >
                        <FaTiktok size={16} />
                      </a>
                    )}
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-full bg-blue-500/10 border border-blue-400/40 text-blue-300 hover:bg-blue-500 hover:text-white transition-all shadow-md"
                      >
                        <FaFacebook size={16} />
                      </a>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </header>

          {/* === BARRA HORARIO / UBICACIÓN === */}
          {(schedule || address) && (
            <section className="px-4 mt-2 md:mt-0">
              <ScrollReveal>
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-600/40 rounded-2xl p-4 flex justify-between divide-x divide-slate-700/70 text-xs md:text-[13px]">
                  {schedule && (
                    <div className="flex-1 flex flex-col items-center px-2 text-center">
                      <FaClock className="mb-1 text-cyan-300" />
                      <span className="text-[10px] uppercase font-semibold tracking-[0.18em] text-slate-400">
                        Hours
                      </span>
                      <span className="mt-1 text-slate-100 leading-snug">
                        {schedule}
                      </span>
                    </div>
                  )}
                  {address && (
                    <div className="flex-1 flex flex-col items-center px-2 text-center">
                      <FaMapMarkerAlt className="mb-1 text-amber-300" />
                      <span className="text-[10px] uppercase font-semibold tracking-[0.18em] text-slate-400">
                        Location
                      </span>
                      <span className="mt-1 text-slate-100 leading-snug line-clamp-2">
                        {address}
                      </span>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </section>
          )}

          {/* === CONTENIDO PRINCIPAL === */}
          <main className="px-4 md:px-6 pb-32 md:pb-36 space-y-10 mt-6">
            {/* PUBLICACIONES */}
            <ScrollReveal>
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] md:text-sm font-semibold flex items-center gap-2 text-slate-100">
                    <span
                      className="w-1 h-5 rounded-full"
                      style={{ backgroundImage: `linear-gradient(180deg, ${primary}, ${accent})` }}
                    />
                    Posts
                  </h2>
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    <FaImages size={10} />
                    <span>See more</span>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/70">
                  <PostGridModal accountSlug={accountSlug} accentColor={primary} />
                </div>
              </section>
            </ScrollReveal>

            {/* GALERÍA */}
            {gallery && gallery.length > 0 && (
              <ScrollReveal>
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[13px] md:text-sm font-semibold flex items-center gap-2 text-slate-100">
                      <span
                        className="w-1 h-5 rounded-full"
                        style={{ backgroundImage: `linear-gradient(180deg, ${accent}, ${primary})` }}
                      />
                      Recent Work
                    </h2>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/70">
                    <PremiumCarousel
                      images={gallery}
                      accentColor={primary}
                      autoPlay
                      interval={3800}
                    />
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* SERVICIOS */}
            {services && services.length > 0 && (
              <ScrollReveal>
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-1 h-5 rounded-full"
                      style={{ backgroundColor: primary }}
                    />
                    <h2 className="text-[13px] md:text-sm font-semibold text-slate-100">
                      Detailing Services
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px] md:text-xs">
                    {services.map((service, i) => (
                      <div
                        key={`${service}-${i}`}
                        className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-3 flex items-center gap-2 hover:border-cyan-400/70 hover:shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-cyan-300/80 text-xs">
                          <FaCar />
                        </div>
                        <span className="line-clamp-2 text-slate-100">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* RESEÑAS */}
            <ScrollReveal>
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-yellow-400" />
                  <h2 className="text-[13px] md:text-sm font-semibold text-slate-100">
                    Customer Reviews
                  </h2>
                </div>
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 md:p-5">
                  <ReviewsList profileId={profileId} accentColor={accent} />
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <ReviewForm profileId={profileId} accentColor={primary} />
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </main>

          {/* === CTA: AGENDAR CITA (BookingWidget) - Solo si el módulo está activo === */}
          {hasBookingModule && (
            <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4 z-50 md:bottom-6">
              <div className="w-full max-w-md">
                <div className="rounded-[999px] p-[1px] bg-gradient-to-r from-cyan-400 via-sky-500 to-amber-300 shadow-[0_0_40px_rgba(56,189,248,0.6)]">
                  <div className="rounded-[999px] bg-slate-950/95">
                    <BookingWidget
                      config={bookingConfig}
                      className="w-full text-[11px] md:text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón flotante lateral para contenido extra */}
          <ContentButton accountSlug={accountSlug} accentColor={primary} position="left" />

          {/* Botón flotante WhatsApp directo */}
          {socialLinks.whatsapp && (
            <a
              href={`https://wa.me/${socialLinks.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-24 right-4 w-11 h-11 md:w-12 md:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 border-2 border-emerald-300/60 z-30 md:bottom-28"
            >
              <FaWhatsapp size={20} />
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default CarWashTemplate;

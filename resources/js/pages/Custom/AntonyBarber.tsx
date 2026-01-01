import React, { useEffect, useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaClock,
  FaStar,
  FaCut,
  FaCrown,
  FaChevronRight,
} from 'react-icons/fa';

// Componentes
import { BookingWidget } from '@/components/booking/BookingWidget';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { LoadingScreen } from '@/components/LoadingScreen';

// --- Interfaces (tu estructura) ---
interface Link {
  title: string;
  url: string;
}
interface ProfileData {
  bio?: string;
  links?: Link[];
  phone?: string;
  address?: string;
  hours?: string;

  // Galería desde DB
  gallery?: { url: string; caption?: string }[] | string;

  // Opcionales (ajústalos si tienes campos reales)
  logo_url?: string;
  cover_url?: string;

  services?: string[];
}
interface ProfileMedia {
  id: number;
  url: string;
  file_path?: string;
  caption?: string;
  media_type?: string;
}

interface Profile {
  id: number;
  name: string;
  title: string;
  data: ProfileData;
  gallery?: ProfileMedia[];
  logo?: ProfileMedia;
  cover?: ProfileMedia;
  loading_screen?: ProfileMedia;
}
interface SeoData {
  title: string;
  description: string;
  keywords: string;
  image: string | null;
  url: string;
  site_name: string;
  type: string;
  structured_data: any;
}

interface PageProps {
  profile: Profile;
  seo?: SeoData;
  [key: string]: any;
}

/**
 * Normaliza cualquier URL de imagen que venga de BD.
 * Soporta:
 * - https://...
 * - /storage/...
 * - storage/...
 * - gallery/...
 */
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;

  // Si guardas "storage/xxxx"
  const cleaned = s.replace(/^storage\//, '');
  return `/storage/${cleaned}`;
};

/**
 * Fondo Animado Barbería
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
      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center
      bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg
      group-hover:scale-110 transition-transform duration-300`}
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

const MajesticBarberCard = () => {
  const { profile, seo } = usePage<PageProps>().props;

  const primaryGold = '#fbbf24';

  // Loading Screen State
  const [isLoading, setIsLoading] = useState(true);
  const loadingScreenUrl = profile.loading_screen?.url
    ? resolveMediaUrl(profile.loading_screen.url)
    : null;

  // Parallax
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Links
  const whatsappLink =
    profile.data.links?.find((l) => l.title.toLowerCase().includes('whatsapp'))?.url ||
    '#';
  const instagramLink = profile.data.links?.find((l) =>
    l.title.toLowerCase().includes('instagram')
  )?.url;
  const tiktokLink = profile.data.links?.find((l) =>
    l.title.toLowerCase().includes('tiktok')
  )?.url;

  // ====== GALERÍA (DB) ======
  const galleryImages: CarouselImage[] = useMemo(() => {
    const raw = (profile as any).gallery;

    if (!Array.isArray(raw)) return [];

    // ✅ SIN FILTRO - acepta tanto imágenes como videos
    return raw
      .map((m: any) => ({
        url: resolveMediaUrl(m?.url || m?.file_path),
        caption: m?.caption,
        thumbnail: m?.thumbnail_url ? resolveMediaUrl(m.thumbnail_url) : undefined,
      }))
      .filter((img: any) => !!img.url);
  }, [profile]);


  // Servicios
  const services = profile.data.services || [
    'Corte Clásico',
    'Skin Fade',
    'Barba Premium',
    'Perfilado',
    'Black Mask',
    'Tinte',
  ];

  // Widget booking
  const bookingConfig = {
    profileId: profile.id,
    businessName: profile.name,
    services: services,
    accentColor: primaryGold,
    socialLinks: {
      instagram: instagramLink,
      tiktok: tiktokLink,
      whatsapp: whatsappLink,
    },
  };

  // SEO
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // 🔥 SIN FALLBACKS - para debugging
  console.log('🔍 DEBUG profile.cover:', profile.cover);
  console.log('🔍 DEBUG profile.logo:', profile.logo);
  console.log('🔍 DEBUG profile.gallery:', profile.gallery);

  const coverImage = resolveMediaUrl(profile.cover?.url);
  const logoImage = resolveMediaUrl(profile.logo?.url);
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

      <Head title={`${seo?.title || profile.name}`}>
        {/* Meta básicos */}
        <meta name="description" content={seo?.description || profile.title} />
        <meta name="keywords" content={seo?.keywords || 'TRIBIO, reservas online'} />
        <link rel="canonical" href={seo?.url || pageUrl} />

        {/* Open Graph (WhatsApp, Facebook) */}
        <meta property="og:type" content={seo?.type || 'website'} />
        <meta property="og:title" content={seo?.title || profile.name} />
        <meta property="og:description" content={seo?.description || profile.title} />
        {seo?.image && <meta property="og:image" content={seo.image} />}
        {!seo?.image && ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={seo?.url || pageUrl} />
        <meta property="og:site_name" content={seo?.site_name || 'TRIBIO'} />
        <meta property="og:locale" content="es_PE" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo?.title || profile.name} />
        <meta name="twitter:description" content={seo?.description || profile.title} />
        {seo?.image && <meta name="twitter:image" content={seo.image} />}
        {!seo?.image && ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* JSON-LD (Google) */}
        {seo?.structured_data && (
          <script type="application/ld+json">
            {JSON.stringify(seo.structured_data)}
          </script>
        )}
      </Head>

      <div
        className="relative w-full flex flex-col overflow-hidden bg-slate-950 min-h-screen font-sans text-gray-100
        md:max-w-screen-md md:h-[860px] md:rounded-[40px] md:shadow-2xl md:shadow-black md:mx-auto md:border md:border-white/5"
      >
        <BarberBackground />

        {/* --- HERO --- */}
        <header className="relative h-[460px] shrink-0">
          <div className="absolute inset-0 overflow-hidden">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                style={{ transform: `translateY(${y * 0.5}px) scale(1.1)` }}
                className="w-full h-full object-cover transition-transform duration-75 will-change-transform"
              />
            ) : (
              <div className="w-full h-full bg-slate-950" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 z-10 text-center">
            <div className="mb-5 animate-fade-up">
              <div className="w-24 h-24 rounded-full border border-amber-500/30 p-1 bg-black/60 backdrop-blur-sm shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                {logoImage ? (
                  <img
                    src={logoImage}
                    className="w-full h-full object-cover rounded-full"
                    alt="Logo"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-500 text-2xl font-bold">
                    {profile.name?.slice(0, 2)?.toUpperCase() || 'MB'}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 animate-fade-up delay-100 tracking-tight drop-shadow-2xl">
              {profile.name || 'MAJESTIC'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                BARBER
              </span>
            </h1>

            <div className="flex items-center gap-3 animate-fade-up delay-200 mb-4">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-amber-500/50" />
              <p className="text-amber-100/70 text-xs sm:text-sm uppercase tracking-[0.3em] font-medium">
                {profile.title || 'Professional Cuts & Shaves'}
              </p>
              <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            <div className="flex items-center gap-3 animate-fade-up delay-300">
              <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <FaStar className="text-amber-400 text-xs" />
                <span className="text-xs font-bold text-white">5.0 Rating</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <FaCrown className="text-amber-400 text-xs" />
                <span className="text-xs font-bold text-white">VIP</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- MAIN --- */}
        <main className="relative z-20 flex-1 px-4 sm:px-6 pb-32 space-y-8 -mt-4">
          <ScrollReveal animation="scale">
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl border border-white/5 shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/20">
                Experiencia Premium
              </div>

              <p className="text-gray-300 leading-relaxed font-light text-center text-sm sm:text-base">
                {profile.data.bio ||
                  'Cortes de alto nivel, precisión al detalle y un acabado que impone respeto.'}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="slide-left">
            <section>
              <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2 px-2">
                <span className="w-1 h-6 bg-amber-500 rounded-full" />
                <span>Síguenos - Ver Nuestro Trabajo</span>
              </h2>
              <div className="space-y-3">
                {instagramLink && (
                  <PremiumSocialButton
                    href={instagramLink}
                    icon={<FaInstagram size={24} />}
                    title="@majestic.barber01"
                    subtitle="Portafolio en Instagram"
                    brandColor="from-purple-600 via-pink-600 to-orange-500"
                  />
                )}
                {tiktokLink && (
                  <PremiumSocialButton
                    href={tiktokLink}
                    icon={<FaTiktok size={22} />}
                    title="@majesticbarber01"
                    subtitle="Tutoriales y Cortes"
                    brandColor="from-cyan-500 via-black to-red-500"
                  />
                )}
              </div>
            </section>
          </ScrollReveal>

          {/* GALERÍA (solo si hay imágenes) */}
          {galleryImages.length > 0 && (
            <ScrollReveal animation="fade">
              <section>
                <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2 px-2">
                  <span className="text-amber-500">✨</span>
                  <span>
                    Nuestros <span className="text-amber-500">Trabajos</span>
                  </span>
                </h2>
                <PremiumCarousel
                  images={galleryImages}
                  accentColor={primaryGold}
                  autoPlay={true}
                  interval={4000}
                />
              </section>
            </ScrollReveal>
          )}

          <ScrollReveal animation="slide-right">
            <section>
              <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2 px-2">
                <FaStar className="text-amber-500" />
                <span>Opiniones de Nuestros Clientes</span>
              </h2>
              <ReviewsList profileId={profile.id} accentColor={primaryGold} />
            </section>
          </ScrollReveal>

          <ScrollReveal animation="scale">
            <section>
              <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2 px-2">
                <span className="text-2xl">💬</span>
                <span>Comparte Tu Experiencia</span>
              </h2>
              <div className="rounded-2xl bg-slate-900/50 p-6 border border-white/5">
                <ReviewForm profileId={profile.id} accentColor={primaryGold} />
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal animation="blur">
            <section className="rounded-2xl bg-slate-900/50 p-6 border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-500 border border-amber-500/20">
                  <FaClock size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-wide">
                    Horario
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 leading-snug">
                    {profile.data.hours || 'Lun - Sáb: 10:00 AM - 9:00 PM'}
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal animation="fade">
            <section>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-2">
                <FaCut className="text-amber-500" />
                <span className="text-amber-500/80">•</span>
                <span>Servicios</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {services.slice(0, 6).map((service, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-xl bg-slate-900 border border-white/5 p-4 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                  >
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-gray-400 text-xs sm:text-sm font-medium text-center relative z-10 group-hover:text-amber-100 transition-colors">
                      {service}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        </main>

        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none z-30 md:absolute md:rounded-b-[40px]" />

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center
          bg-[#25D366] text-white shadow-lg shadow-green-900/50 border-2 border-green-400/30
          hover:scale-110 active:scale-95 transition-all duration-300 
          md:absolute md:bottom-28 md:right-6"
        >
          <FaWhatsapp size={28} />
        </a>

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

export default function MajesticBarberPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-950 md:p-10">
      <MajesticBarberCard />
    </div>
  );
}

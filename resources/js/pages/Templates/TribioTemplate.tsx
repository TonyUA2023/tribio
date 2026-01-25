import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
  FaGlobe,
  FaChevronRight,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaFingerprint,
  FaQrcode,
  FaNetworkWired,
  FaUser,
} from 'react-icons/fa';

// Componentes
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { normalizeSocialLinks } from '@/utils/socialLinks';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StoryCircle } from '@/components/stories/StoryCircle';
import PostGridModal from '@/components/posts/PostGridModal';
import { ShareButton } from '@/components/ShareButton';

// --- INTERFACES ---
export interface TribioTemplateConfig {
  primaryColor: string;
  backgroundColor: string;
  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;
  businessName: string;
  businessTitle: string;
  businessBio?: string;
  businessCategory?: string;

  // Información de contacto
  phone?: string;
  email?: string;
  address?: string;
  website?: string;

  // Redes sociales
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };

  // Galería/Portfolio
  gallery?: CarouselImage[];

  // Datos del perfil
  profileId: number;
  accountSlug: string;
  isPremium?: boolean;
}

interface TribioTemplateProps {
  config: TribioTemplateConfig;
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

// --- COMPONENTES VISUALES ---

/**
 * Fondo Tech Tribio - Minimalista con efecto sutil
 */
const TribioBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-0 bg-slate-50">
    {/* Grid sutil */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #00d9ff 1px, transparent 1px),
          linear-gradient(to bottom, #00d9ff 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />

    {/* Gradiente superior */}
    <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-cyan-50/40 via-transparent to-transparent" />

    {/* Efecto de luz */}
    <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-[120px]" />
  </div>
);

/**
 * Botón de Contacto Limpio
 */
const ContactButton = ({
  icon,
  label,
  value,
  href,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  accentColor: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative flex items-center gap-4 p-4 rounded-2xl overflow-hidden
      bg-white border border-gray-100 hover:border-gray-200
      transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
      style={{ backgroundColor: `${accentColor}10` }}
    >
      <div style={{ color: accentColor }}>
        {icon}
      </div>
    </div>

    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900 truncate">
        {value}
      </span>
    </div>

    <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <FaChevronRight className="text-gray-300" size={14} />
    </div>
  </a>
);

/**
 * Botón Social Tribio
 */
const TribioSocialButton = ({
  icon,
  label,
  username,
  href,
  brandColor,
}: {
  icon: React.ReactNode;
  label: string;
  username: string;
  href: string;
  brandColor: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative flex items-center gap-4 p-4 rounded-2xl overflow-hidden
      bg-white border border-gray-100 hover:border-gray-200
      transition-all duration-300 hover:shadow-lg"
  >
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${brandColor}`}
      style={{ opacity: 0.03 }}
    />

    <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform duration-300">
      <div className="text-gray-600">
        {icon}
      </div>
    </div>

    <div className="relative z-10 flex flex-col flex-1 min-w-0">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900 truncate">
        {username}
      </span>
    </div>

    <div className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <FaChevronRight className="text-gray-300" size={14} />
    </div>
  </a>
);

/**
 * Estadística/Feature Card
 */
const FeatureCard = ({
  icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor: string;
}) => (
  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100">
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: `${accentColor}10` }}
    >
      <div style={{ color: accentColor }} className="text-lg">
        {icon}
      </div>
    </div>
    <span className="text-2xl font-bold text-gray-900">{value}</span>
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
      {label}
    </span>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export const TribioTemplate: React.FC<TribioTemplateProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(() => ({
    ...config,
    ...(customizations || {}),
  }), [config, customizations]);

  const {
    primaryColor = '#00d9ff', // Cyan del logo
    loadingImage,
    coverImage,
    logoImage,
    businessName,
    businessTitle,
    businessBio,
    phone,
    email,
    address,
    website,
    socialLinks = {},
    gallery = [],
    profileId,
    accountSlug,
    isPremium = false,
  } = finalConfig;

  // Normalize social links
  const normalizedLinks = useMemo(() => normalizeSocialLinks(socialLinks), [socialLinks]);

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [y, setY] = useState(0);

  // URLs
  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;

  // Parallax Effect
  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {isLoading && (
        <LoadingScreen
          logoUrl={loadingScreenUrl}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1200}
        />
      )}

      <Head title={businessName}>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      {/* Container Principal */}
      <div className="flex justify-center items-center min-h-screen bg-gray-100 md:p-10">

        <div
          className="relative w-full flex flex-col overflow-hidden bg-slate-50 min-h-screen
          md:max-w-screen-md md:h-[860px] md:rounded-[40px] md:shadow-2xl md:mx-auto md:border md:border-gray-200 md:overflow-y-auto custom-scrollbar"
        >
          <TribioBackground />

          {/* --- HERO SECTION --- */}
          <header className="relative shrink-0">
            {/* Cover Image */}
            <div className="h-48 overflow-hidden relative bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
              {resolvedCover ? (
                <>
                  <img
                    src={resolvedCover}
                    alt="Cover"
                    style={{ transform: `translateY(${y * 0.5}px) scale(1.05)` }}
                    className="w-full h-full object-cover transition-transform duration-75 will-change-transform opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/60 via-blue-500/60 to-purple-600/60 mix-blend-multiply" />
                </>
              ) : null}
            </div>

            {/* Profile Info */}
            <div className="relative px-6 -mt-16 pb-6">
              {/* Logo Circle */}
              <div className="mb-4">
                <StoryCircle
                  profileId={profileId}
                  logoUrl={resolvedLogo}
                  name={businessName}
                  size="xl"
                  accentColor={primaryColor}
                  className="shadow-xl ring-4 ring-white bg-white"
                />
              </div>

              {/* Name & Title */}
              <div className="mb-3">
                <h1 className="text-3xl font-black text-gray-900 leading-tight mb-1">
                  {businessName}
                </h1>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {businessTitle}
                </p>
              </div>

              {/* Bio */}
              {businessBio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {businessBio}
                </p>
              )}

              {/* Premium Badge */}
              {isPremium && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                  <FaFingerprint size={12} />
                  Perfil Verificado
                </div>
              )}
            </div>
          </header>

          {/* --- MAIN CONTENT --- */}
          <main className="relative z-20 flex-1 px-6 pb-24 space-y-6">

            {/* Contacto Rápido */}
            <ScrollReveal animation="fade">
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Contacto
                </h2>
                <div className="space-y-3">
                  {phone && (
                    <ContactButton
                      icon={<FaPhone size={18} />}
                      label="Teléfono"
                      value={phone}
                      href={`tel:${phone}`}
                      accentColor={primaryColor}
                    />
                  )}
                  {normalizedLinks.whatsapp && (
                    <ContactButton
                      icon={<FaWhatsapp size={20} />}
                      label="WhatsApp"
                      value="Enviar mensaje"
                      href={normalizedLinks.whatsapp}
                      accentColor="#25D366"
                    />
                  )}
                  {email && (
                    <ContactButton
                      icon={<FaEnvelope size={18} />}
                      label="Email"
                      value={email}
                      href={`mailto:${email}`}
                      accentColor={primaryColor}
                    />
                  )}
                  {address && (
                    <ContactButton
                      icon={<FaMapMarkerAlt size={18} />}
                      label="Ubicación"
                      value={address}
                      href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                      accentColor="#EA4335"
                    />
                  )}
                  {website && (
                    <ContactButton
                      icon={<FaGlobe size={18} />}
                      label="Sitio web"
                      value={website.replace(/^https?:\/\//, '')}
                      href={website}
                      accentColor={primaryColor}
                    />
                  )}
                </div>
              </section>
            </ScrollReveal>

            {/* Redes Sociales */}
            {(normalizedLinks.instagram || normalizedLinks.facebook || normalizedLinks.linkedin || normalizedLinks.tiktok) && (
              <ScrollReveal animation="slide-left">
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
                    Síguenos
                  </h2>
                  <div className="space-y-3">
                    {normalizedLinks.instagram && (
                      <TribioSocialButton
                        href={normalizedLinks.instagram}
                        icon={<FaInstagram size={22} />}
                        label="Instagram"
                        username={`@${accountSlug}`}
                        brandColor="from-purple-600 via-pink-600 to-orange-500"
                      />
                    )}
                    {normalizedLinks.facebook && (
                      <TribioSocialButton
                        href={normalizedLinks.facebook}
                        icon={<FaFacebook size={22} />}
                        label="Facebook"
                        username={businessName}
                        brandColor="from-blue-600 to-blue-700"
                      />
                    )}
                    {normalizedLinks.linkedin && (
                      <TribioSocialButton
                        href={normalizedLinks.linkedin}
                        icon={<FaLinkedin size={22} />}
                        label="LinkedIn"
                        username={businessName}
                        brandColor="from-blue-700 to-blue-800"
                      />
                    )}
                    {normalizedLinks.tiktok && (
                      <TribioSocialButton
                        href={normalizedLinks.tiktok}
                        icon={<FaTiktok size={20} />}
                        label="TikTok"
                        username={`@${accountSlug}`}
                        brandColor="from-black to-gray-800"
                      />
                    )}

                    {/* Compartir */}
                    <div
                      className="group relative flex items-center gap-4 p-4 rounded-2xl overflow-hidden
                        bg-white border border-gray-100 hover:border-gray-200
                        transition-all duration-300 hover:shadow-lg cursor-pointer"
                    >
                      <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50">
                        <ShareButton
                          url={typeof window !== 'undefined' ? window.location.href : ''}
                          title={businessName}
                          text={businessBio || `Conoce ${businessName}`}
                          iconSize={22}
                          color="#4B5563"
                        />
                      </div>
                      <div className="relative z-10 flex flex-col flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Compartir perfil
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Enviar a contactos
                        </span>
                      </div>
                      <div className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <FaChevronRight className="text-gray-300" size={14} />
                      </div>
                    </div>
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Galería/Portfolio */}
            {gallery.length > 0 && (
              <ScrollReveal animation="fade">
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
                    Portfolio
                  </h2>
                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                    <PremiumCarousel
                      images={gallery}
                      accentColor={primaryColor}
                      autoPlay={true}
                      interval={4000}
                    />
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Posts Grid */}
            <ScrollReveal animation="fade">
              <section data-posts-section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Publicaciones
                </h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <PostGridModal
                    accountSlug={accountSlug}
                    accentColor={primaryColor}
                  />
                </div>
              </section>
            </ScrollReveal>

            {/* Reseñas */}
            <ScrollReveal animation="slide-right">
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  Opiniones
                </h2>
                <div className="space-y-4">
                  <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                  <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
                    <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                  </div>
                </div>
              </section>
            </ScrollReveal>

          </main>

          {/* --- FLOATING BUTTONS --- */}


          {/* Botón Flotante WhatsApp */}
          {normalizedLinks.whatsapp && (
            <a
              href={normalizedLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center
              bg-[#25D366] text-white shadow-xl shadow-green-500/20
              hover:scale-110 active:scale-95 transition-all duration-300
              md:absolute"
            >
              <FaWhatsapp size={28} />
            </a>
          )}

          {/* Gradiente inferior */}
          <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pointer-events-none z-30 md:absolute md:rounded-b-[40px]" />

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease-out; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default TribioTemplate;

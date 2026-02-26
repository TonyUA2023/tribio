import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaGlobe,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronRight,
  FaCheckCircle,
  FaBolt,
  FaDove // Icono de paloma para toque religioso
} from 'react-icons/fa';

// --- TUS COMPONENTES IMPORTADOS ---
import { BookingWidget } from '@/components/booking/BookingWidget';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { normalizeSocialLinks } from '@/utils/socialLinks';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StoryCircle } from '@/components/stories/StoryCircle';
import PostGridModal from '@/components/posts/PostGridModal';

// --- INTERFACES ---
export interface Personal3DConfig {
  primaryColor?: string; // Color principal (ej: Dorado #d4af37)
  coverImage?: string;
  logoImage?: string;
  businessName: string;
  businessTitle: string;
  businessBio?: string;
  services: string[];
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    website?: string;
    email?: string;
    location?: string;
    [key: string]: string | undefined;
  };
  profileId: number;
  accountSlug: string;
  showRating?: boolean;
  rating?: number;
  ctaMode?: 'booking' | 'contact' | 'none'; 
}

interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: string;
  site_name?: string;
  structured_data?: Record<string, unknown>;
}

interface TemplateProps {
  config: Personal3DConfig;
  seo?: SeoData;
  account?: { id: number; slug: string; name: string };
}

// --- UTILIDADES ---
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (s.startsWith('http')) return s;
  return `/uploaded_files/${s.replace(/^uploaded_files\//, '')}`;
};

const SOCIAL_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram /> },
  { key: 'tiktok', label: 'TikTok', icon: <FaTiktok /> },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
  { key: 'website', label: 'Sitio Web', icon: <FaGlobe /> },
  { key: 'email', label: 'Email', icon: <FaEnvelope /> },
  { key: 'location', label: 'Ubicación', icon: <FaMapMarkerAlt /> },
];

// --- HOOK TILT (Solo Desktop) ---
const useTilt = (active: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !active) return;
    const el = ref.current;
    const handleMove = (e: MouseEvent) => {
      const height = el.clientHeight;
      const width = el.clientWidth;
      const xVal = e.layerX;
      const yVal = e.layerY;
      const yRotation = 2 * ((xVal - width / 2) / width);
      const xRotation = -2 * ((yVal - height / 2) / height);
      el.style.transform = `perspective(1000px) scale(1.005) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
    };
    const handleOut = () => {
      el.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseout', handleOut);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseout', handleOut);
    };
  }, [active]);
  return ref;
};

// --- BOTÓN ELEGANTE (Premium) ---
const ElegantLinkButton = ({ href, icon, label, primaryColor }: { href: string, icon: React.ReactNode, label: string, primaryColor: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative flex items-center justify-between p-4 mb-3 rounded-2xl
      bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-white/5 
      hover:border-white/20 hover:from-slate-800 hover:to-slate-700
      transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-lg backdrop-blur-md"
  >
    <div className="flex items-center gap-4">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl text-white shadow-inner border border-white/5"
        style={{ background: `linear-gradient(135deg, ${primaryColor}80, ${primaryColor}20)` }}
      >
        {icon}
      </div>
      <span className="font-medium text-gray-100 text-sm tracking-wide group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
    <div className="text-white/20 group-hover:text-white/60 transition-colors text-sm pr-2 transform group-hover:translate-x-1 duration-300">
      <FaChevronRight />
    </div>
  </a>
);

// --- COMPONENTE PRINCIPAL ---
export const PersonalProfile3D: React.FC<TemplateProps> = ({ config, seo, account }) => {
  // Color por defecto Dorado Eclesiástico si no viene uno
  const primaryColor = config.primaryColor || '#d4af37'; 
  
  const {
    loadingImage,
    coverImage,
    logoImage,
    businessName,
    businessTitle,
    businessBio,
    services = [],
    socialLinks = {},
    profileId,
    accountSlug,
    showRating = true,
    rating = 5.0,
    ctaMode = 'contact'
  } = config;

  // Normalize social links
  const normalizedLinks = useMemo(() => normalizeSocialLinks(socialLinks), [socialLinks]);

  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tiltRef = useTilt(!isMobile);

  const activeLinks = useMemo(() => {
    return SOCIAL_PLATFORMS.filter(platform => {
      const url = normalizedLinks[platform.key];
      return url && url.length > 0;
    }).map(platform => ({
      ...platform,
      url: socialLinks[platform.key]!
    }));
  }, [socialLinks]);

  const bookingConfig = {
    profileId,
    businessName,
    services,
    accentColor: primaryColor,
    socialLinks,
    language: 'es' as const,
  };

  return (
    <>
      {isLoading && <LoadingScreen />}

      <Head title={seo?.title || `${businessName} | Perfil Oficial`}>
        <meta name="description" content={seo?.description || businessBio || `${businessName} - ${businessTitle}`} />
        <meta name="keywords" content={seo?.keywords || `${businessName}, ${businessTitle}, perfil profesional`} />
        <link rel="canonical" href={seo?.url || (account ? `https://tribio.info/${account.slug}` : '')} />

        <meta property="og:type" content={seo?.type || 'profile'} />
        <meta property="og:title" content={seo?.title || businessName} />
        <meta property="og:description" content={seo?.description || businessBio || businessTitle} />
        <meta property="og:url" content={seo?.url || (account ? `https://tribio.info/${account.slug}` : '')} />
        <meta property="og:site_name" content={seo?.site_name || 'TRIBIO'} />
        <meta property="og:locale" content="es_PE" />
        {(seo?.image || resolvedCover || resolvedLogo) && (
          <meta property="og:image" content={seo?.image || resolvedCover || resolvedLogo} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo?.title || businessName} />
        <meta name="twitter:description" content={seo?.description || businessBio || businessTitle} />
        {(seo?.image || resolvedCover || resolvedLogo) && (
          <meta name="twitter:image" content={seo?.image || resolvedCover || resolvedLogo} />
        )}

        <meta name="theme-color" content="#020617" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

        {seo?.structured_data && (
          <script type="application/ld+json">
            {JSON.stringify(seo.structured_data)}
          </script>
        )}
      </Head>

      {/* FONDO GLOBAL: Degradado solemne (Slate oscuro a negro) */}
      <div className="min-h-screen bg-[#020617] flex flex-col items-center py-0 md:py-10 overflow-x-hidden selection:bg-amber-500/30 font-sans">
        
        {/* Efectos de Luz de Fondo (Atmósfera) */}
        <div className="fixed top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-slate-900 to-transparent opacity-50 pointer-events-none -z-10" />
        <div 
            className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none -z-10" 
            style={{ background: primaryColor, opacity: 0.15 }}
        />

        {/* WRAPPER PRINCIPAL */}
        <div 
          ref={tiltRef}
          className={`w-full md:max-w-[420px] relative z-10 transition-transform duration-300 ease-out`}
          style={!isMobile ? { transformStyle: 'preserve-3d' } : {}}
        >
          {/* CONTENEDOR DE LA TARJETA (Full width en móvil, Card en desktop) */}
          {/* AQUÍ ESTÁ EL CAMBIO CLAVE: min-h-screen en móvil para eliminar bordes */}
          <div className="bg-transparent md:bg-slate-950/80 md:backdrop-blur-xl md:border md:border-white/10 md:rounded-[32px] md:shadow-2xl relative min-h-screen md:min-h-auto overflow-hidden">
            
            {/* 1. PORTADA CON FADE */}
            <div className="relative h-48 w-full overflow-hidden">
                {resolvedCover ? (
                    <img src={resolvedCover} className="w-full h-full object-cover opacity-70 scale-105" alt="Cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-950" />
                )}
                {/* Degradado suave para unir portada con contenido */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
            </div>

            {/* 2. INFORMACIÓN DEL PERFIL */}
            <div className="px-5 pb-10 -mt-24 flex flex-col items-center relative z-20">
                
                {/* Foto de Perfil / Story */}
                <div className="mb-4 relative group">
                    {/* Brillo detrás de la foto */}
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    
                    <StoryCircle 
                        profileId={profileId}
                        logoUrl={resolvedLogo}
                        name={businessName}
                        size="lg"
                        className="shadow-2xl ring-4 ring-[#020617] relative z-10"
                    />
                    
                    {/* Badge Verificado */}
                    <div className="absolute bottom-1 right-1 z-20 bg-blue-500 text-white p-1 rounded-full border-[3px] border-[#020617] text-[12px] shadow-lg">
                        <FaCheckCircle />
                    </div>
                </div>

                {/* Nombre y Título (Tipografía mejorada) */}
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-white mb-2 text-center tracking-wide drop-shadow-lg">
                    {businessName}
                </h1>
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm mb-4">
                    <span 
                      className="text-[11px] font-bold uppercase tracking-[0.2em]" 
                      style={{ color: primaryColor }}
                    >
                        {businessTitle}
                    </span>
                </div>

                {/* Estado y Valoración */}
                {showRating && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-6">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Online
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1 text-amber-400">
                             <FaBolt size={10} /> 5.0 Excelencia
                        </span>
                    </div>
                )}

                {/* Biografía */}
                {businessBio && (
                    <div className="w-full bg-slate-900/40 rounded-2xl p-4 border border-white/5 text-center mb-8 backdrop-blur-sm">
                        <p className="text-sm text-slate-300 leading-relaxed font-light italic">
                            "{businessBio}"
                        </p>
                    </div>
                )}

                {/* 3. LISTA DE ENLACES */}
                <div className="w-full mb-8 space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                         <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-slate-500"></div>
                         <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conecta Conmigo</h3>
                         <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-slate-500"></div>
                    </div>
                    
                    {activeLinks.map((link) => (
                        <ScrollReveal key={link.key} animation="fade">
                            <ElegantLinkButton 
                                href={link.url}
                                icon={link.icon}
                                label={link.label}
                                primaryColor={primaryColor}
                            />
                        </ScrollReveal>
                    ))}
                </div>

                {/* 4. WIDGET DE RESERVAS / EVENTOS */}
                {ctaMode === 'booking' && (
                    <div className="w-full mb-8 relative z-30">
                         <div className="flex items-center justify-center gap-2 mb-3">
                            <FaDove className="text-slate-500 text-xs" />
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agenda Ministerial</h3>
                         </div>
                         <div className="p-1 rounded-[20px] bg-gradient-to-br from-white/10 to-transparent">
                             <BookingWidget 
                                config={bookingConfig} 
                                className="!bg-slate-900 !border-none !shadow-xl !text-sm" 
                             />
                         </div>
                    </div>
                )}

                {/* 5. MULTIMEDIA (GRID) */}
                <div className="w-full border-t border-white/5 pt-8">
                     <div className="flex justify-between items-end mb-4 px-2">
                        <h3 className="text-slate-200 font-serif text-lg">Galería</h3>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Ver Todo</span>
                     </div>
                     <div className="rounded-2xl overflow-hidden border border-white/5 bg-slate-900/50 shadow-inner min-h-[100px]">
                        <PostGridModal 
                            accountSlug={accountSlug}
                            accentColor={primaryColor}
                        />
                     </div>
                </div>

                {/* 6. TESTIMONIOS */}
                <div className="w-full mt-8">
                    <div className="bg-slate-900/30 rounded-3xl p-6 border border-white/5">
                        <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider text-center border-b border-white/5 pb-4">
                            Testimonios
                        </h3>
                        <div className="text-xs">
                             <ReviewsList profileId={profileId} accentColor={primaryColor} />
                        </div>
                        <div className="mt-6">
                             <ReviewForm profileId={profileId} accentColor={primaryColor} />
                        </div>
                    </div>
                </div>

                {/* Footer simple */}
                <div className="mt-12 text-center pb-32 md:pb-4 opacity-50">
                    <p className="text-[10px] text-slate-500 font-medium">
                        Plataforma Oficial
                    </p>
                </div>

            </div> {/* Fin Contenido interno */}

          </div> {/* Fin Card/Container */}
        </div> {/* Fin Tilt Wrapper */}


      </div>
    </>
  );
};

export default PersonalProfile3D;
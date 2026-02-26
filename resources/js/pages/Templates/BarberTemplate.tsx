// resources/js/Pages/templates/AcademyTemplate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaBook,
  FaClock,
  FaMapMarkerAlt,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";

import { BookingWidget } from "@/components/booking/BookingWidget";
import { PremiumCarousel, CarouselImage } from "@/components/gallery/PremiumCarousel";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import { normalizeSocialLinks } from "@/utils/socialLinks";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StoryCircle } from "@/components/stories/StoryCircle";
import PostGridModal from "@/components/posts/PostGridModal";
import { ShareButton } from "@/components/ShareButton";

// --- TIPOS ---
export interface AcademyConfig {
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;

  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;

  businessName: string;
  businessTitle: string;
  businessBio?: string;

  services?: any;
  schedule?: string;
  address?: string;

  // Soportar ambos nombres como en otros templates
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    [key: string]: any;
  };
  social_links?: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    [key: string]: any;
  };

  gallery?: CarouselImage[];
  profileId: number;
  accountSlug: string;
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

interface AcademyProps {
  config: AcademyConfig;
  customizations?: any;
  seo?: SeoData;
  account?: { id: number; slug: string; name: string };
}

// --- UTIL ---
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return "";
  const s = String(raw).trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return s;
  const cleaned = s.replace(/^uploaded_files\//, "");
  return `/uploaded_files/${cleaned}`;
};

// Fondo vino + dorado
const AcademyBackground = ({ bg }: { bg: string }) => (
  <div className="fixed inset-0 -z-10 pointer-events-none" style={{ backgroundColor: bg }}>
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          "radial-gradient(circle at top, rgba(255,215,0,0.25), transparent 60%)",
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"2\" cy=\"2\" r=\"1\" fill=\"%23B8860B\"/%3E%3C/svg%3E')",
      }}
    />
  </div>
);

// Botón social premium
const SocialButton = ({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 
      border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/30
      transition-all duration-300"
  >
    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/40 border border-white/10">
      <div className="text-white">{icon}</div>
    </div>

    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-[10px] uppercase tracking-widest text-gray-300">
        {subtitle}
      </span>
      <span className="text-white font-semibold truncate">{title}</span>
    </div>

    <FaChevronRight className="text-white/40 group-hover:text-white transition" />
  </a>
);

// --- COMPONENTE PRINCIPAL ---
const AcademyTemplate: React.FC<AcademyProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(
    () => ({
      primaryColor: "#B8860B",
      backgroundColor: "#4A0000",
      accentColor: "#FFD700",
      ...config,
      ...(customizations || {}),
    }),
    [config, customizations]
  );

  const {
    primaryColor,
    backgroundColor,
    accentColor = "#FFD700",
    loadingImage,
    coverImage,
    logoImage,
    businessName,
    businessTitle,
    businessBio,
    services,
    schedule,
    address,
    socialLinks: links1 = {},
    social_links: links2 = {},
    gallery = [],
    profileId,
    accountSlug,
  } = finalConfig;

  // Mezcla de socialLinks y social_links para soportar ambos formatos
  const rawSocialLinks = useMemo(
    () => ({
      ...(links2 || {}),
      ...(links1 || {}),
    }),
    [links1, links2]
  );

  // Normalizar (añade https, wa.me, etc.)
  const normalizedLinks = useMemo(
    () => normalizeSocialLinks(rawSocialLinks),
    [rawSocialLinks]
  );

  const [isLoading, setIsLoading] = useState(true);

  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const loadingScreenUrl = loadingImage
    ? resolveMediaUrl(loadingImage)
    : resolvedLogo || undefined;

  const servicesArray: any[] = Array.isArray(services) ? services : [];

  // Config para Booking (igual que otros templates)
  const bookingConfig = {
    profileId,
    businessName,
    services: servicesArray,
    accentColor: primaryColor,
    socialLinks: rawSocialLinks,
    language: 'es' as const,
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        logoUrl={loadingScreenUrl}
        onLoadingComplete={() => setIsLoading(false)}
        minDuration={1000}
      />
    );
  }

  return (
    <>
      <Head title={businessName || "Academia"}>
        <meta name="theme-color" content={backgroundColor || "#4A0000"} />
      </Head>

      <AcademyBackground bg={backgroundColor || "#4A0000"} />

      <div className="min-h-screen w-full flex justify-center text-white">
        <div className="w-full max-w-2xl px-5 pt-6 pb-24 relative">
          {/* HERO */}
          <section className="mb-6">
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
              <div className="h-36 w-full overflow-hidden relative">
                {resolvedCover ? (
                  <img
                    src={resolvedCover}
                    alt={businessName}
                    className="w-full h-full object-cover opacity-95"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#5a0000] via-[#2b0000] to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              <div className="px-5 pb-5 pt-4 flex flex-col items-center text-center">
                {resolvedLogo && (
                  <div className="-mt-14 mb-3">
                    <div className="w-24 h-24 rounded-full border-4 border-yellow-500/70 bg-black/80 flex items-center justify-center overflow-hidden shadow-lg shadow-black/70">
                      <img
                        src={resolvedLogo}
                        alt={businessName}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  </div>
                )}

                <h1
                  className="text-2xl font-bold tracking-wide"
                  style={{ color: accentColor }}
                >
                  {businessName}
                </h1>
                <p className="text-sm text-gray-200 mt-1">{businessTitle}</p>

                {businessBio && (
                  <p className="text-xs text-gray-200/90 mt-3 leading-relaxed max-w-md">
                    {businessBio}
                  </p>
                )}

                <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px]">
                  {schedule && (
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 flex items-center gap-1.5">
                      <FaClock className="text-yellow-300" />
                      {schedule}
                    </span>
                  )}
                  {address && (
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-red-300" />
                      <span className="truncate max-w-[160px]">{address}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Stories */}
          <ScrollReveal>
            <section className="mb-6">
              <StoryCircle profileId={profileId} accentColor={primaryColor} />
            </section>
          </ScrollReveal>

          {/* Feed de posts / videos */}
          <ScrollReveal>
            <section className="mb-8" data-posts-section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span style={{ color: accentColor }}>🎬</span>
                <span>Feed de la academia</span>
              </h2>
              <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
              </div>
            </section>
          </ScrollReveal>

          {/* Programas / Cursos */}
          {servicesArray.length > 0 && (
            <ScrollReveal>
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: accentColor }}
                  >
                    Programas y Cursos
                  </h2>
                  <FaBook className="text-yellow-400" />
                </div>

                <div className="grid gap-3">
                  {servicesArray.map((srv: any, index: number) => {
                    const isObject = srv && typeof srv === "object";
                    const key =
                      isObject && (srv.id ?? srv.title)
                        ? `${srv.id ?? srv.title}`
                        : index;

                    const title = isObject
                      ? srv.title || `Programa ${index + 1}`
                      : String(srv);

                    const description =
                      isObject && srv.description ? String(srv.description) : "";

                    const features: any[] =
                      isObject && Array.isArray(srv.features) ? srv.features : [];

                    return (
                      <div
                        key={key}
                        className="p-4 rounded-2xl bg-black/40 border border-white/15"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/60">
                            <FaBook className="text-yellow-300" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold mb-1">
                              {title}
                            </h3>
                            {description && (
                              <p className="text-xs text-gray-200 mb-1">
                                {description}
                              </p>
                            )}
                            {features.length > 0 && (
                              <ul className="mt-1 text-[11px] text-gray-200 list-disc list-inside space-y-0.5">
                                {features.map((f, fi) => (
                                  <li key={fi}>{String(f)}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </ScrollReveal>
          )}

          {/* Galería */}
          {gallery && gallery.length > 0 && (
            <ScrollReveal>
              <section className="mb-8">
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: accentColor }}
                >
                  Nuestra academia en imágenes
                </h2>
                <PremiumCarousel images={gallery} accentColor={primaryColor} />
              </section>
            </ScrollReveal>
          )}

          {/* Redes Sociales */}
          <ScrollReveal>
            <section className="mb-8">
              <h2
                className="text-lg font-bold mb-3"
                style={{ color: accentColor }}
              >
                Redes sociales
              </h2>
              <div className="space-y-3">
                {normalizedLinks.whatsapp && (
                  <SocialButton
                    icon={<FaWhatsapp />}
                    title={normalizedLinks.whatsapp.replace("https://wa.me/", "")}
                    subtitle="WhatsApp"
                    href={normalizedLinks.whatsapp}
                  />
                )}
                {normalizedLinks.facebook && (
                  <SocialButton
                    icon={<FaFacebook />}
                    title="Facebook"
                    subtitle={businessName}
                    href={normalizedLinks.facebook}
                  />
                )}
                {normalizedLinks.instagram && (
                  <SocialButton
                    icon={<FaInstagram />}
                    title={normalizedLinks.instagram}
                    subtitle="Instagram"
                    href={normalizedLinks.instagram}
                  />
                )}
                {normalizedLinks.tiktok && (
                  <SocialButton
                    icon={<FaTiktok />}
                    title={normalizedLinks.tiktok}
                    subtitle="TikTok"
                    href={normalizedLinks.tiktok}
                  />
                )}

                {/* Compartir */}
                <div className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mt-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <ShareButton
                      url={
                        typeof window !== "undefined" ? window.location.href : ""
                      }
                      title={businessName}
                      text={businessBio || `Conoce ${businessName}`}
                      iconSize={18}
                      color="#ffffff"
                    />
                  </div>
                  <span className="text-sm font-medium">
                    Compartir esta academia
                  </span>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Reseñas */}
          <ScrollReveal>
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <FaStar className="text-yellow-300" />
                <h2
                  className="text-lg font-bold"
                  style={{ color: accentColor }}
                >
                  Opiniones de estudiantes
                </h2>
              </div>
              <div className="bg-black/40 border border-white/15 rounded-2xl p-4">
                <ReviewsList profileId={profileId} accentColor={primaryColor} />
                <div className="mt-4 pt-4 border-t border-white/10">
                  <ReviewForm profileId={profileId} accentColor={primaryColor} />
                </div>
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>


      {/* Booking fijo abajo */}
      <div className="fixed bottom-6 left-4 right-4 z-50 md:absolute md:bottom-6 md:w-[calc(100%-32px)]">
        <BookingWidget
          config={bookingConfig}
          className="shadow-2xl shadow-black ring-1 ring-white/10 w-full"
        />
      </div>

      {/* Botón flotante WhatsApp directo */}
      {normalizedLinks.whatsapp && (
        <a
          href={normalizedLinks.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-24 right-4 w-11 h-11 md:w-12 md:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 border-2 border-emerald-300/60 z-50 md:bottom-28"
        >
          <FaWhatsapp size={20} />
        </a>
      )}
    </>
  );
};

export default AcademyTemplate;

import React, { useEffect, useRef, useState } from "react";
import {
  FaWhatsapp, FaPhoneAlt, FaEnvelope, FaGlobe, FaInstagram, FaTiktok,
  FaArrowRight, FaTimes, FaCheck, FaFacebook, FaPlay, FaPause, FaStar, FaCalendarAlt
} from "react-icons/fa";

/** ========== Paleta & Assets (FIRMA) ========== */
const ACCENT = "#E10600";
const LOGO = "/business/firma/logo-firma.png";
const ANDY_PHOTO = "/business/firma/andy-leon.png";

/** Logos (confianza) */
const BRAND_LOGOS = [
  "/business/firma/clients/1.png",
  "/business/firma/clients/2.png",
  "/business/firma/clients/3.png",
  "/business/firma/clients/4.png",
  "/business/firma/clients/5.png",
];

const CONTACT = {
  whatsapp: "https://wa.me/51949896413?text=Hola%20FIRMA%2C%20quiero%20impulsar%20mi%20marca",
  phone: "tel:+51949896413",
  email: "mailto:hola@firma.agency",
  website: "https://tu-dominio.com",
  instagram: "https://instagram.com/firma.agency",
  tiktok: "https://tiktok.com/@firma.agency",
  facebook: "https://facebook.com/firma.agency",
  /** Cambia por tu enlace real de agenda (Cal.com o Calendly) */
  agenda: "https://cal.com/andy-leon/30min"
};

const PLANS = [
  { name: "Contenido Esencial", bullets: ["4–8 posts/mes", "2 reels de 20s", "Mini sesión fotográfica", "Calendario básico"] },
  { name: "Contenido Avanzado", bullets: ["8–12 posts/mes", "4 reels de 20s", "Sesión fotográfica pro", "Copy + pauta táctica"] },
  { name: "Contenido Performance", bullets: ["+12 posts/mes", "6 reels de 20s", "Sesión avanzada", "Optimización y métricas"] }
];

/** Servicios especializados (ahora con features opcionales) */
type Extra = { title: string; desc: string; features?: string[] };
const EXTRAS: Extra[] = [
  { title: "Fotografía profesional", desc: "Retratos, producto y lifestyle con iluminación de estudio y edición fina." },
  { title: "Alquiler de salón de fotografía", desc: "Estudio equipado en Huancayo: fondos, luces, props y asistencia básica." },
  {
    title: "Growth & Ads 360",
    desc: "Ejecución integral para crecer con velocidad y control.",
    features: [
      "Community Manager",
      "Publicidad pagada (Google Ads, Facebook Ads, etc.)",
      "Planes de marketing de contenido"
    ]
  }
];

/** Galería */
type GalleryItem = { src: string; alt: string; caption?: string; subtitle?: string };
const GALLERY: GalleryItem[] = [
  { src: "/business/firma/gallery/1.png", alt: "Retrato corporativo", caption: "Retrato corporativo", subtitle: "Luz suave · Look profesional" },
  { src: "/business/firma/gallery/2.png", alt: "Producto en estudio", caption: "Producto en estudio", subtitle: "Fondos limpios · Detalle" },
  { src: "/business/firma/gallery/3.png", alt: "Lifestyle de marca", caption: "Lifestyle de marca", subtitle: "Espontáneo · Color real" },
  { src: "/business/firma/gallery/4.png", alt: "Backstage en set", caption: "Backstage en set", subtitle: "Equipo · Proceso creativo" },
  { src: "/business/firma/gallery/5.png", alt: "Detalle iluminación", caption: "Detalle de iluminación", subtitle: "Key light · Relleno" },
  { src: "/business/firma/gallery/6.png", alt: "Equipo creativo", caption: "Equipo creativo", subtitle: "Sinergia · Dirección de arte" },
];

/** Testimonios */
type Testimonial = { name: string; role: string; quote: string; avatar?: string };
const TESTIMONIALS: Testimonial[] = [
  { name: "María G.", role: "CMO · Retail", quote: "Pasamos de publicar sin estrategia a crecer 3x en interacciones en 60 días. El equipo entiende negocio y estética." },
  { name: "Carlos R.", role: "CEO · Tech", quote: "Nos ayudaron a elevar la marca. Fotos impecables, guiones de reels claros y un calendario que el equipo ama." },
  { name: "Lucía P.", role: "Fundadora · Beauty", quote: "El estudio en Huancayo es top. La sesión salió tal cual moodboard. Y el contenido mantiene coherencia de color." },
];

/** ========== Motion & Blur ========== */
const Motion = () => (
  <style>{`
    @keyframes iosFadeSlide { 0%{opacity:0;transform:translateY(8px) scale(.995)} 100%{opacity:1;transform:none} }
    @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

    .scroll-init{opacity:0;will-change:transform,opacity}
    .ios-in{animation:iosFadeSlide .45s cubic-bezier(.22,.7,.25,1) both}
    .ios-in-d1{animation-delay:.06s}.ios-in-d2{animation-delay:.12s}.ios-in-d3{animation-delay:.18s}

    .ios-hover-lift{transition:transform .3s cubic-bezier(.25,.8,.5,1),box-shadow .3s cubic-bezier(.25,.8,.5,1),opacity .2s}
    .ios-hover-lift:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.03)}
    .ios-pulse:active,.ios-hover-lift:active{transform:scale(.95);opacity:.85;box-shadow:none!important}

    .glass-light{background:rgba(255,255,255,.82);backdrop-filter:blur(14px) saturate(1.6);-webkit-backdrop-filter:blur(14px) saturate(1.6);border:1px solid rgba(0,0,0,.07)}
    .hero-blur-gradient{position:absolute;left:0;right:0;bottom:0;height:68%;backdrop-filter:blur(26px) saturate(1.35);-webkit-backdrop-filter:blur(26px) saturate(1.35);-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,1) 0%,rgba(0,0,0,.75) 35%,rgba(0,0,0,.35) 62%,rgba(0,0,0,0) 100%);mask-image:linear-gradient(to top,rgba(0,0,0,1) 0%,rgba(0,0,0,.75) 35%,rgba(0,0,0,.35) 62%,rgba(0,0,0,0) 100%)}
    .hero-tint{position:absolute;left:0;right:0;bottom:0;height:68%;background:linear-gradient(to top,rgba(255,255,255,.28) 0%,rgba(255,255,255,.14) 38%,rgba(255,255,255,0) 80%);pointer-events:none}

    /* Coverflow */
    .cf-stage{perspective:1400px;isolation:isolate}
    .cf-wrap{position:relative;overflow:visible;height:380px}
    @media (min-width:640px){.cf-wrap{height:560px}} @media (min-width:768px){.cf-wrap{height:670px}}
    .cf-card{transition:transform .55s cubic-bezier(.22,.7,.25,1),opacity .4s ease,box-shadow .4s ease;will-change:transform,opacity;box-shadow:0 18px 50px rgba(0,0,0,.12);z-index:0;cursor:zoom-in}
    .cf-card.is-active{z-index:10}
    .cf-caption{position:absolute;left:0;right:0;bottom:0;padding:18px 18px 20px;color:white;opacity:0;transform:translateY(8px);transition:opacity .35s ease,transform .35s ease;text-shadow:0 2px 18px rgba(0,0,0,.5);pointer-events:none}
    .cf-card.is-active .cf-caption{opacity:1;transform:none}
    .cf-caption::before{content:"";position:absolute;inset:0;border-radius:28px;background:linear-gradient(to top,rgba(0,0,0,.52) 0%,rgba(0,0,0,.28) 45%,rgba(0,0,0,0) 70%);z-index:-1}
    .cf-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.92);border:1px solid rgba(0,0,0,.08);width:44px;height:44px;border-radius:9999px;display:grid;place-items:center;box-shadow:0 10px 24px rgba(0,0,0,.10)}
    .cf-dots button{height:8px;width:8px;border-radius:9999px;background:rgba(0,0,0,.18)}
    .cf-dots button[aria-current="true"]{background:${ACCENT};transform:scale(1.15)}

    .marquee{display:flex;gap:48px;white-space:nowrap;will-change:transform;animation:marquee 18s linear infinite}

    @media (prefers-reduced-motion:reduce){
      .ios-in,.ios-in-d1,.ios-in-d2,.ios-in-d3,.ios-pulse,.ios-hover-lift,.marquee{animation:none!important;transition:none!important}
      .scroll-init{opacity:1!important}
    }

    .chip{
  display:inline-flex; align-items:center; gap:8px;
  padding:6px 12px; border-radius:9999px; font-weight:600; font-size:12px;
  background: linear-gradient(180deg,#f7f7f8 0%, #efeff2 100%);
  border:1px solid #d2d5da; color:#111; text-shadow:none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }
  .chip:hover{ transform: translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,.06); }
  .chip:focus-visible{ outline:2px solid ${ACCENT}; outline-offset:2px; }
  .chip-dot{ display:inline-block; width:6px; height:6px; border-radius:9999px; background:${ACCENT}; }

  /* Modo oscuro (si el SO lo usa) */
  @media (prefers-color-scheme: dark){
    .chip{
      background: rgba(255,255,255,.12);
      border:1px solid rgba(255,255,255,.28);
      color:#fff; box-shadow:none;
    }
    .chip:hover{ box-shadow:0 8px 22px rgba(0,0,0,.35); }
  }
  `}</style>
);

/** ========== Lightbox ========== */
function Lightbox({ imgs, index, onClose }:{
  imgs: { src: string; alt: string }[], index: number, onClose: ()=>void
}) {
  const [i, setI] = useState(index);
  const prev = () => setI(p => (p - 1 + imgs.length) % imgs.length);
  const next = () => setI(p => (p + 1) % imgs.length);
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md grid place-items-center p-4">
      <button aria-label="Cerrar" onClick={onClose}
        className="absolute top-8 right-8 text-white/90 hover:text-white bg-black/70 h-10 w-10 rounded-full grid place-items-center ios-pulse">
        <FaTimes size={18}/>
      </button>
      <div className="relative max-w-5xl w-full">
        <img src={imgs[i].src} alt={imgs[i].alt} className="w-full h-auto rounded-[24px] shadow-2xl"/>
        <div className="mt-3 flex items-center justify-between text-white/90 text-sm px-2">
          <button onClick={prev} className="ios-pulse px-4 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 font-medium">Anterior</button>
          <span>{i+1} / {imgs.length}</span>
          <button onClick={next} className="ios-pulse px-4 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 font-medium">Siguiente</button>
        </div>
      </div>
    </div>
  );
}

/** ========== Botones iOS ========== */
function PillPrimary({ href, children, aria }:{ href:string; children:React.ReactNode; aria?:string }) {
  return (
    <a href={href} aria-label={aria}
      className="ios-pulse inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-lg"
      style={{ background:`linear-gradient(180deg, ${ACCENT} 0%, #B90500 100%)`, boxShadow:`0 8px 20px ${ACCENT}40` }}>
      {children}
    </a>
  );
}
function PillGhost({ href, children }:{ href:string; children:React.ReactNode }) {
  return (
    <a href={href}
      className="ios-pulse inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium"
      style={{ border:"1px solid rgba(0,0,0,.15)", color:"#111", background:"rgba(255,255,255,.92)", boxShadow:"0 2px 4px rgba(0,0,0,.04)" }}>
      {children}
    </a>
  );
}

/** ========== Contactos ========== */
type ContactItem = { href:string; label:string; sub?:string; icon: React.ReactNode };

function ContactTiles({ items }:{ items: ContactItem[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {items.map((it) => (
        <a key={it.label} href={it.href}
           className="group rounded-[20px] p-4 bg-white/90 border border-black/5 relative overflow-hidden ios-hover-lift"
           style={{ boxShadow:'inset 0 1px 0 rgba(255,255,255,.6), 0 8px 24px rgba(0,0,0,.06)' }}>
          <span className="pointer-events-none absolute inset-0 rounded-[20px]"
                style={{ border:'1px solid transparent', background:`linear-gradient(white,white) padding-box, conic-gradient(from 180deg at 50% 50%, ${ACCENT}33, transparent 40%, ${ACCENT}33) border-box` }} />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-full grid place-items-center text-white shadow" style={{ background:`linear-gradient(180deg, ${ACCENT}, #B90500)` }}>
              {it.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-black">{it.label}</div>
              {it.sub && <div className="text-xs text-neutral-600 truncate">{it.sub}</div>}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function ContactIconBar({ items }:{ items: ContactItem[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-start gap-3">
      {items.map((it) => (
        <a key={it.label} href={it.href}
           className="relative h-10 w-10 rounded-full grid place-items-center ios-hover-lift"
           aria-label={it.label}
           style={{ background:'white', border:'1px solid rgba(0,0,0,.08)', boxShadow:'0 6px 16px rgba(0,0,0,.06)' }}>
          <span className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background:`radial-gradient(120% 120% at 50% 0%, ${ACCENT}22, transparent 60%)` }}/>
          <span className="relative text-[17px]" style={{ color: ACCENT }}>{it.icon}</span>
        </a>
      ))}
    </div>
  );
}

/** ========== Coverflow ========== */
function CoverflowCarousel({ items, onOpen }:{ items: GalleryItem[], onOpen:(i:number)=>void }) {
  const [idx, setIdx] = useState(0);
  const wrap = (i:number) => (i + items.length) % items.length;
  const timer = useRef<number | null>(null);
  const touch = useRef<{x:number|null}>({ x: null });
  const next = () => setIdx(i => wrap(i + 1));
  const prev = () => setIdx(i => wrap(i - 1));

  useEffect(() => {
    const loop = () => { timer.current = window.setTimeout(() => { next(); loop(); }, 3600); };
    loop();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => { touch.current.x = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touch.current.x === null) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 44) dx < 0 ? next() : prev();
    touch.current.x = null;
  };

  return (
    <div className="cf-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="cf-wrap">
        <div className="absolute inset-0 flex items-center justify-center">
          {items.map((it, i) => {
            const d = ((i - idx + items.length) % items.length);
            const pos = d === 0 ? 0 : d === 1 ? 1 : d === 2 ? 2 : d === items.length-1 ? -1 : d === items.length-2 ? -2 : 3;
            if (Math.abs(pos) > 2) return null;
            const translateX = pos * 160;
            const rotateY   = pos * -18;
            const scale     = pos === 0 ? 1 : 0.9;
            const z         = 100 - Math.abs(pos);

            return (
              <div key={it.src}
                   className={`cf-card absolute rounded-[28px] overflow-hidden ${pos===0?'is-active':''}`}
                   style={{ width:'68%', maxWidth:520, aspectRatio:'4 / 5', transform:`translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`, zIndex:z, opacity:(pos===2||pos===-2)?0.92:1, background:'white' }}
                   onClick={() => onOpen(i)} role="button" aria-label={`Abrir ${it.alt}`}>
                <img src={it.src} alt={it.alt} className="w-full h-full object-cover" />
                <div className="cf-caption">
                  <div className="text-lg sm:text-xl font-bold leading-tight">{it.caption ?? it.alt}</div>
                  {it.subtitle && <div className="text-xs sm:text-sm opacity-90">{it.subtitle}</div>}
                </div>
              </div>
            );
          })}
        </div>
        <button aria-label="Anterior" onClick={prev} className="cf-nav left-1 sm:left-3 ios-pulse">‹</button>
        <button aria-label="Siguiente" onClick={next} className="cf-nav right-1 sm:right-3 ios-pulse">›</button>
        <div className="cf-dots absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button key={i} aria-current={i===idx} aria-label={`Ir a slide ${i+1}`} onClick={() => setIdx(i)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ========== Animate On Scroll ========== */
function AnimateOnScroll({ children, className, threshold = 0.1 } : { children: React.ReactNode; className?: string; threshold?: number; }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) { setIsVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } });
    }, { rootMargin: "0px 0px -50px 0px", threshold });
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [threshold]);
  return <div ref={ref} className={`scroll-init ${isVisible ? `ios-in ${className ?? ''}` : ''}`}>{children}</div>;
}

/** ========== KPI Counter ========== */
function StatCounter({ to, label }:{ to:number; label:string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(() => {
    let raf:number; let start:number|undefined;
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      const animate = (ts:number) => {
        if (start === undefined) start = ts;
        const p = Math.min(1, (ts - start) / 900);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(eased * to));
        if (p < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate); obs.disconnect();
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { if (raf) cancelAnimationFrame(raf); obs.disconnect(); };
  }, [to]);
  return (
    <div ref={ref} className="text-center px-3 py-4 rounded-2xl glass-light border">
      <div className="text-3xl font-extrabold tracking-tight" style={{ color: ACCENT }}>{val.toLocaleString()}+</div>
      <div className="text-xs text-neutral-600 font-medium">{label}</div>
    </div>
  );
}

/** ========== Testimonios (Play/Pause NEGRO) ========== */
function TestimonialCarousel({ items }:{ items: Testimonial[] }) {
  const [idx, setIdx] = useState(0);
  const [play, setPlay] = useState(true);
  useEffect(() => {
    if (!play) return;
    const t = setInterval(() => setIdx(i => (i+1) % items.length), 3800);
    return () => clearInterval(t);
  }, [items.length, play]);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {items.map((t, i) => (
            <div key={i} className="min-w-full px-1">
              <div className="glass-light border rounded-[24px] p-5 ios-hover-lift">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  {Array.from({length:5}).map((_,i)=><FaStar key={i} />)}
                </div>
                <p className="text-neutral-800 text-sm leading-relaxed">“{t.quote}”</p>
                <div className="mt-3 text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-neutral-600">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón negro visible */}
      <button
        onClick={()=>setPlay(p=>!p)}
        aria-label={play?'Pausar':'Reproducir'}
        className="absolute -top-5 right-0 h-10 w-10 rounded-full grid place-items-center ios-hover-lift"
        style={{ background: '#000', color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,.2)' }}
      >
        {play ? <FaPause/> : <FaPlay/>}
      </button>

      <div className="mt-3 flex gap-2 justify-center">
        {items.map((_,i)=>(
          <button key={i} onClick={()=>setIdx(i)} aria-label={`Ir a testimonio ${i+1}`}
                  className="h-2 w-2 rounded-full"
                  style={{ background: i===idx? ACCENT : "rgba(0,0,0,.18)" }}/>
        ))}
      </div>
    </div>
  );
}

/** ========== Componente principal ========== */
export default function FirmaIOSCard() {
  const [lightbox, setLightbox] = useState<number|null>(null);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white pb-28">
      <Motion />
      {/* Halos sutiles */}
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-30 -z-10"
           style={{ background: `radial-gradient(circle at 30% 30%, ${ACCENT}55, transparent 60%)` }} />
      <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-30 -z-10"
           style={{ background: `radial-gradient(circle at 70% 70%, ${ACCENT}33, transparent 60%)` }} />

      <div className="mx-auto md:my-10 md:max-w-screen-md">
        <div className="overflow-hidden md:rounded-[36px] shadow-[0_24px_50px_rgba(0,0,0,.1)] border border-white/70 bg-white/70 glass-light">

          {/* HERO */}
          <AnimateOnScroll className="ios-in-d1">
            <section className="relative h-[480px]">
              <img src={ANDY_PHOTO} alt="Andy León, Gerente" className="absolute inset-0 w-full h-full object-cover"/>
              <div className="absolute top-5 left-5 z-10">
                <div className="relative">
                  <span aria-hidden="true" className="absolute -inset-2 rounded-2xl bg-white/80 blur-xl" style={{ boxShadow: "0 6px 18px rgba(0,0,0,.08)" }} />
                  <span aria-hidden="true" className="absolute inset-0 rounded-2xl backdrop-blur-md" style={{ border: "1px solid rgba(255,255,255,.65)" }} />
                  <img src={LOGO} alt="FIRMA logo" className="relative w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] object-contain rounded-xl" />
                </div>
              </div>

              {/* Blur degradado + tint */}
              <div className="hero-blur-gradient"></div>
              <div className="hero-tint"></div>

              {/* Contenido */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <div className="glass-light rounded-xl p-4 inline-block mb-3 border-none shadow-md">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-extrabold tracking-tight text-black">Andy León</h2>
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: ACCENT }} />
                  </div>
                  <p className="text-base text-neutral-600 font-medium">Gerente · Estrategia & Performance</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <PillPrimary href={CONTACT.whatsapp} aria="WhatsApp con Andy León">
                    <FaWhatsapp/> Iniciar Proyecto
                  </PillPrimary>
                  <PillGhost href={CONTACT.phone}><FaPhoneAlt/> Llamar</PillGhost>
                </div>
              </div>
            </section>
          </AnimateOnScroll>

          {/* Logos confianza - marquee */}
          <AnimateOnScroll>
            <section className="px-5 sm:px-8 pt-6 pb-2 section-head-blur">
              <div className="text-xs text-neutral-500 font-medium mb-2">Marcas que confían</div>
              <div className="overflow-hidden">
                <div className="marquee">
                  {[...BRAND_LOGOS, ...BRAND_LOGOS].map((src, i) => (
                    <img key={i} src={src} alt={`logo-${i}`} className="h-8 w-auto opacity-80" />
                  ))}
                </div>
              </div>
            </section>
          </AnimateOnScroll>

          {/* Contacto directo */}
          <AnimateOnScroll>
            <section className="px-5 sm:px-8 pt-6 pb-8 section-head-blur">
              <div className="flex items-end justify-between">
                <h3 className="text-xl font-bold text-black">Contacto directo</h3>
                <span className="text-sm text-neutral-600 font-medium">Respuestas rápidas · Soporte humano</span>
              </div>
              <ContactTiles
                items={[
                  { href: CONTACT.whatsapp, label: 'WhatsApp', sub: 'Inicia tu proyecto', icon: <FaWhatsapp/> },
                  { href: CONTACT.phone,    label: 'Llamar',   sub: 'Habla con Andy',    icon: <FaPhoneAlt/> },
                  { href: CONTACT.email,    label: 'Email',    sub: 'hola@firma.agency', icon: <FaEnvelope/> },
                  { href: CONTACT.tiktok,   label: 'TikTok',   sub: '@firma.agency',     icon: <FaTiktok/> },
                  { href: CONTACT.facebook, label: 'Facebook', sub: '/firma.agency',     icon: <FaFacebook/> },
                ]}
              />
              <ContactIconBar
                items={[
                  { href: CONTACT.instagram, label: 'Instagram', icon: <FaInstagram/> },
                  { href: CONTACT.tiktok,    label: 'TikTok',    icon: <FaTiktok/> },
                  { href: CONTACT.facebook,  label: 'Facebook',  icon: <FaFacebook/> },
                  { href: CONTACT.website,   label: 'Web',       icon: <FaGlobe/> },
                  { href: CONTACT.email,     label: 'Email',     icon: <FaEnvelope/> },
                ]}
              />
            </section>
          </AnimateOnScroll>

          {/* KPIs */}
          <AnimateOnScroll className="ios-in-d2">
            <section className="px-5 sm:px-8 pb-8 section-head-blur">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCounter to={120} label="Proyectos de contenido" />
                <StatCounter to={380} label="Piezas producidas/mes" />
                <StatCounter to={45}  label="Marcas activas" />
                <StatCounter to={3}   label="Días para iniciar" />
              </div>
            </section>
          </AnimateOnScroll>

          {/* Coverflow */}
          <AnimateOnScroll className="ios-in-d2">
            <section className="px-5 sm:px-8 pt-8 pb-12 section-head-blur">
              <div className="flex items-end justify-between">
                <h3 className="text-xl font-bold text-black">Highlights recientes</h3>
                <span className="text-sm text-neutral-600 font-medium">Desliza · AutoPlay</span>
              </div>
              <div className="mt-6">
                <CoverflowCarousel items={GALLERY} onOpen={(i)=>setLightbox(i)}/>
              </div>
            </section>
          </AnimateOnScroll>

          {/* Proceso en 4 pasos */}
          <AnimateOnScroll className="ios-in-d2">
            <section className="px-5 sm:px-8 pb-12 section-head-blur">
              <h3 className="text-xl font-bold text-black">Cómo trabajamos</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  {t:"Kickoff", d:"Objetivos, público, tono. Moodboard inicial."},
                  {t:"Producción", d:"Sesión foto/video, guiones y props."},
                  {t:"Edición & QA", d:"Colorimetría, cortes y revisión rápida."},
                  {t:"Calendar", d:"Programación + pauta táctica y métricas."},
                ].map((s, i)=>(
                  <div key={i} className="ios-hover-lift rounded-[24px] p-5 glass-light border">
                    <div className="text-xs font-semibold text-neutral-600">Paso {i+1}</div>
                    <div className="mt-1 font-semibold text-black">{s.t}</div>
                    <p className="text-sm text-neutral-700 mt-1">{s.d}</p>
                  </div>
                ))}
              </div>
            </section>
          </AnimateOnScroll>

          {/* Servicios */}
          <AnimateOnScroll className="ios-in-d3">
            <section className="px-5 sm:px-8 pb-10 section-head-blur">
              <h3 className="text-xl font-bold text-black">Servicios Especializados</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXTRAS.map((x) => (
                  <div key={x.title} className="ios-hover-lift rounded-[24px] p-5 border border-white/70 bg-white/70 glass-light cursor-pointer">
                    <div className="font-semibold text-black">{x.title}</div>
                    <p className="text-sm text-neutral-700 mt-1">{x.desc}</p>

                    {/* Chips de features si existen */}
                    {x.features && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {x.features.map((f) => (
                          <span
                            key={f}
                            className="text-xs font-semibold px-3 py-1 rounded-full text-black"
                            style={{
                              background: "rgba(0,0,0,.06)",
                              border: "1px solid rgba(0,0,0,.08)"
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <a href={CONTACT.whatsapp} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold ios-pulse" style={{ color: ACCENT }}>
                      Hablar con Andy <FaArrowRight/>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </AnimateOnScroll>

          {/* Testimonios (Social proof real) */}
          <AnimateOnScroll className="ios-in-d3">
            <section className="px-5 sm:px-8 pb-10 section-head-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black">Lo que dicen</h3>
                  <span className="text-sm text-neutral-600 font-medium">Social proof real</span>
                </div>
              </div>
              <div className="mt-4">
                <TestimonialCarousel items={TESTIMONIALS}/>
              </div>
            </section>
          </AnimateOnScroll>

        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox imgs={GALLERY} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      {/* BARRA INFERIOR ANCLADA */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="w-full grid grid-cols-2 gap-2 bg-white/80 backdrop-blur-md border-t border-gray-200 p-3">
          <a href={CONTACT.whatsapp}
             className="ios-pulse w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-xl"
             style={{ background:`linear-gradient(180deg, ${ACCENT} 0%, #B90500 100%)`, boxShadow:`0 8px 20px ${ACCENT}40` }}>
            <FaWhatsapp/> WhatsApp
          </a>
          <a href={CONTACT.phone}
             className="ios-pulse w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold"
             style={{ border:`1px solid ${ACCENT}`, background:"rgba(255,255,255,.95)", color:"#111" }}>
            <FaPhoneAlt/> Llamar
          </a>
        </div>
      </div>
    </div>
  );
}

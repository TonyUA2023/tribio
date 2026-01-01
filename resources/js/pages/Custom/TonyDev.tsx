import React, { useEffect, useState } from 'react';
import {
  FaGlobe,
  FaFacebook,
  FaWhatsapp,
  FaChevronRight,
  FaEnvelope,
  FaInstagram,
  FaTiktok,
  FaPhoneAlt
} from 'react-icons/fa';

/** === Fondo de Circuitos Animados (más visible) === **/
const CircuitBackground = () => (
  <svg
    className="pointer-events-none fixed inset-0 w-full h-full mix-blend-screen -z-0"
    viewBox="0 0 1440 1024"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
    </defs>

    {[80, 200, 340, 480, 640, 780, 920, 1120, 1280].map((x, i) => (
      <path
        key={i}
        d={`M ${x} 0 L ${x} 260
           C ${x} 300 ${x+60} 320 ${x+60} 360
           L ${x+60} 560
           C ${x+60} 600 ${x+120} 620 ${x+120} 660
           L ${x+120} 1024`}
        fill="none"
        stroke="url(#cg)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 16,
          animation: `dashMove ${18 + i*1.5}s linear infinite`
        }}
      />
    ))}

    {[ [180,320], [420,420], [760,520], [1020,640], [1240,360] ].map(([cx,cy],j)=>(
      <circle key={j} cx={cx} cy={cy} r="4" fill="url(#cg)">
        <animate attributeName="r" values="3.5;5;3.5" dur="3.6s" repeatCount="indefinite"/>
      </circle>
    ))}

    <style>{`
      @keyframes dashMove { 
        0% { stroke-dashoffset: 0 } 
        100% { stroke-dashoffset: -160 } 
      }
    `}</style>
  </svg>
);

/** === Botón moderno (texto NO centrado) === **/
const ActionCard = ({ icon, title, subtitle, href, colorClass, shadowClass }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`group relative flex items-center gap-3 p-3 rounded-2xl
      bg-gray-800/60 backdrop-blur-xl border border-white/10
      ${shadowClass} hover:shadow-xl transition-all duration-200
      hover:-translate-y-0.5`}
  >
    {/* Halo dinámico (sin animar por opacity, usamos escala) */}
    <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/20 to-fuchsia-500/10 scale-95 group-hover:scale-100 blur-[6px] transition-transform"></span>

    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} text-white shadow-md shrink-0`}>
      {icon}
    </div>

    {/* Texto alineado a la izquierda */}
    <div className="flex flex-col min-w-0 items-start text-left flex-1">
      <span className="text-[15px] font-semibold text-white truncate">{title}</span>
      <span className="text-xs text-gray-300/90 truncate">{subtitle}</span>
    </div>

    {/* Chevron a la derecha */}
    <FaChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
  </a>
);

// --- Tarjeta Digital Jstack ---
const DannyLeonCardTailwind = () => {
  const companyName = "JSTACK DIGITAL SOLUTIONS";

  const services = [
    { emoji: '🌐', name: 'Páginas Web', description: 'Sitios modernos y ultra-rápidos (SEO + accesibilidad).', image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { emoji: '💻', name: 'Sistemas Web', description: 'Backoffice, paneles y CRUD con seguridad y escalabilidad.', image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { emoji: '📱', name: 'Apps Móviles', description: 'React Native / Expo — iOS y Android listos para publicar.', image: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { emoji: '💳', name: 'Tarjetas NFC/Digitales', description: 'Presentaciones inteligentes con métricas y QR dinámico.', image: 'https://images.pexels.com/photos/7245237/pexels-photo-7245237.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { emoji: '🤖', name: 'Automatización con IA', description: 'Bots, flujos y RPA con IA aplicada al negocio.', image: 'https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  ];

  // Parallax suave
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(Math.min(40, window.scrollY * 0.12));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative w-full flex flex-col overflow-hidden bg-slate-950 min-h-screen md:max-w-screen-md md:h-[812px] md:rounded-[40px] md:shadow-2xl md:shadow-cyan-800/50 md:mx-auto">
      <CircuitBackground />

      {/* HERO STICKY (alto) */}
      <header className="sticky top-0 z-30">
        <div className="relative overflow-hidden">
          <div className="h-[420px] sm:h-[480px] md:h-[480px] w-full relative">
            <img
              src="/business/jstack/danny-leon.png"
              alt="Danny Leon"
              style={{ transform: `translateY(${y * 0.6}px)`, objectPosition: '30% 20%' }}
              className="absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-150"
            />
            {/* Scrim para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent"></div>

            {/* Línea vertical degradada derecha */}
            <div className="pointer-events-none absolute right-3 sm:right-4 top-6 bottom-6 w-[3px] rounded-full bg-gradient-to-b from-cyan-300 via-blue-500 to-fuchsia-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>

            {/* Logo + Nombre empresa */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <div className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-slate-900/60 backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_44px_-10px_rgba(34,211,238,0.7)]">
                <img
                  src="/business/jstack/logo.png"
                  alt="Logo Jstack"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 p-1 ring-2 ring-cyan-400/70"
                />
                <span className="text-white text-sm sm:text-base md:text-lg font-bold tracking-wide font-['Orbitron',_sans-serif]">
                  {companyName}
                </span>
              </div>
            </div>

            {/* Tarjeta compacta de persona */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 max-w-[80%] sm:max-w-[60%]">
              <div className="rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/15 px-4 py-3 shadow-[0_12px_34px_-16px_rgba(0,0,0,0.8)]">
                <h1 className="text-white text-[24px] sm:text-[28px] font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  Danny Leon
                </h1>
                <p className="text-[12px] sm:text-sm text-cyan-200/95 font-semibold mt-0.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                  Gerente Comercial
                </p>
                <div className="mt-2 flex w-full justify-end">
                  <span className="inline-block w-16 h-[3px] bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CUERPO */}
      <main className="relative z-20 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        {/* Accesos rápidos */}
        <section className="px-4 sm:px-6 pt-4">
          <div className="rounded-3xl bg-gray-900/60 border border-white/10 p-3 sm:p-4 shadow-inner relative overflow-hidden">
            {/* Acabado estético: líneas inclinadas animadas (sin opacity) */}
            <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rotate-12 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 blur-2xl scale-100 animate-[pulseSoft_4s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute -left-14 -bottom-14 w-44 h-44 -rotate-6 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 blur-2xl scale-100 animate-[pulseSoft_5s_ease-in-out_infinite]" />

            <h2 className="px-1 pb-2 text-cyan-300 font-semibold text-sm tracking-wide">Accesos rápidos</h2>

            <div className="max-h-[36vh] overflow-y-auto no-scrollbar space-y-3 pr-1">
              <ActionCard
                href="https://JstackHub.com"
                title="Página Web"
                subtitle="JstackHub.com"
                colorClass="bg-cyan-500/90"
                shadowClass="shadow-cyan-500/20"
                icon={<FaGlobe size={18} />}
              />
              <ActionCard
                href="https://www.facebook.com/JstackDigitalSolutions"
                title="Facebook"
                subtitle="JstackDigitalSolutions"
                colorClass="bg-blue-600/90"
                shadowClass="shadow-blue-500/20"
                icon={<span className="text-white"><FaFacebook size={18} /></span>}
              />
              <ActionCard
                href="https://wa.link/38dgxf"
                title="Whatsapp"
                subtitle="Chatea con nosotros"
                colorClass="bg-green-500/90"
                shadowClass="shadow-green-500/20"
                icon={<FaWhatsapp size={18} />}
              />
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section className="px-4 sm:px-6 mt-5 pb-28">
          <div className="rounded-3xl bg-gray-900/60 border border-white/10 p-3 sm:p-4 shadow-inner">
            <h3 className="px-1 pb-2 text-cyan-300 font-semibold text-sm tracking-wide">Servicios de Jstack</h3>

            <div className="grid grid-cols-1 gap-3 max-h-[46vh] overflow-y-auto no-scrollbar pr-1">
              {services.map((s, i) => (
                <div key={i}
                     className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gray-800/60 backdrop-blur-xl">
                  {/* Borde reactivo sin opacity: usamos máscara + translate */}
                  <span className="pointer-events-none absolute -inset-[1px] rounded-[20px] bg-[linear-gradient(90deg,rgba(34,211,238,0.35),rgba(0,0,0,0),rgba(232,121,249,0.35))] [mask-image:linear-gradient(#000,#000)] translate-x-[-10%] group-hover:translate-x-0 transition-transform duration-300"></span>
                  <div className="relative flex items-center p-3 gap-3">
                    <img src={s.image} alt={s.name}
                         className="w-14 h-14 object-cover rounded-xl border-2 border-cyan-600/40" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-semibold truncate">{s.emoji} {s.name}</span>
                      <span className="text-xs text-gray-300/90 line-clamp-2">{s.description}</span>
                    </div>
                    <FaChevronRight className="ml-auto text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* CTA fijo (MÁS ALTO) */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:bottom-5">
        <a
          href="tel:902699916"
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white py-4 md:py-5 rounded-full font-semibold
                     shadow-lg shadow-cyan-500/40 hover:bg-cyan-600 transition-transform hover:scale-[1.03]
                     [padding-bottom:calc(env(safe-area-inset-bottom))] ring-2 ring-cyan-300/50"
          aria-label="Agendar Contacto"
        >
          <FaPhoneAlt size={18} />
          <span>Agendar Contacto</span>
        </a>
      </div>

      {/* Social lateral */}
      <div className="fixed bottom-28 right-4 hidden sm:flex flex-col gap-3 text-gray-300/90 z-30">
        <a href="mailto:danny@jstackhub.com" className="hover:text-red-400 transition-transform hover:-translate-y-0.5"><FaEnvelope size={18} /></a>
        <a href="https://www.instagram.com/ulloatonyal?igsh=N3QwZXI5a2czMjl2&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-transform hover:-translate-y-0.5"><FaInstagram size={18} /></a>
        <a href="https://www.tiktok.com/@jstack2024?_r=1&_t=ZS-9176VFAJMJj" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-transform hover:-translate-y-0.5"><FaTiktok size={18} /></a>
      </div>

      {/* Animación clave custom (sin opacity) */}
      <style>{`
        @keyframes pulseSoft { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>
    </div>
  );
};

// --- Página contenedora ---
export default function TarjetaDannyLeon() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 px-0 md:p-8 box-border">
      <DannyLeonCardTailwind />
    </div>
  );
}

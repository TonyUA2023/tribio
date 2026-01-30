import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

const IMAGES = [
  '/images/landing/1.png',
  '/images/landing/2.png',
  '/images/landing/3.png',
  '/images/landing/4.png',
  '/images/landing/5.png',
];

const RADIUS = 280;
const ROTATION_STEP = IMAGES.length > 0 ? 360 / IMAGES.length : 0;
const FRONT_THRESHOLD = ROTATION_STEP / 2 + 2;
const INTERVAL_MS = 3500;
const ANIMATION_MS = 1100;

export default function Hero() {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validación de slug
  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (slug.trim().length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.get('/api/directory/check-slug', {
          params: { slug: slug.trim() },
        });

        if (response.data.success) {
          setSlugStatus(response.data.available ? 'available' : 'taken');
        }
      } catch (error) {
        console.error('Error checking slug:', error);
        setSlugStatus('idle');
      }
    }, 400);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [slug]);

  const isButtonEnabled = slugStatus === 'available';

  const handleSubmit = () => {
    if (isButtonEnabled) {
      router.visit(`/registro?slug=${slug}`);
    }
  };

  const getInputBorderClass = () => {
    switch (slugStatus) {
      case 'available':
        return 'border-green-500 ring-2 ring-green-200';
      case 'taken':
        return 'border-red-500 ring-2 ring-red-200';
      default:
        return 'border-slate-200';
    }
  };

  const setRotationSafe = (value: number) => {
    const normalized = ((value % 360) + 360) % 360;
    rotationRef.current = normalized;
    setRotation(normalized);
  };

  useEffect(() => {
    if (IMAGES.length === 0) return;

    let intervalId: number | undefined;
    let frameId: number | undefined;

    const snapToStep = () => {
      if (ROTATION_STEP === 0) return;
      const current = rotationRef.current;
      const snapped = Math.round(current / ROTATION_STEP) * ROTATION_STEP;
      setRotationSafe(snapped);
    };

    const animateToNextImage = () => {
      const from = rotationRef.current;
      const to = from + ROTATION_STEP;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / ANIMATION_MS);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = from + (to - from) * eased;
        setRotationSafe(current);

        if (t < 1) {
          frameId = requestAnimationFrame(tick);
        } else {
          setRotationSafe(to);
        }
      };

      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (intervalId != null) return;
      intervalId = window.setInterval(animateToNextImage, INTERVAL_MS);
    };

    const stop = () => {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
      if (frameId != null) {
        cancelAnimationFrame(frameId);
        frameId = undefined;
      }
      snapToStep();
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <section className="relative bg-[#F3F7FF] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* ============ IZQUIERDA: TEXTO (siempre primero) ============ */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-xs sm:text-sm font-medium text-sky-700 border border-sky-200 shadow-sm">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
              <span>Link-in-bio para negocios modernos</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight md:leading-[1.1]">
              Tu identidad digital
              <br />
              para{' '}
              <span className="text-sky-600">
                negocios y equipos.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Crea tu mini página, vende con NFC y administra tanto tu marca
              como a tus colaboradores desde un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/precios">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white text-base px-8 h-12 rounded-full shadow-md shadow-sky-500/40 hover:shadow-lg hover:shadow-sky-500/50"
                >
                  Ver planes
                </Button>
              </Link>

              <Link href="/directorio">
                <Button
                  size="lg"
                  className="
                    w-full sm:w-auto
                    bg-white text-slate-900
                    border border-slate-900
                    hover:bg-slate-900 hover:text-white
                    transition
                    text-base px-8 h-12 rounded-full
                  "
                >
                  Ver tiendas creadas
                </Button>
              </Link>
            </div>

            {/* CREA TU ENLACE TRIBIO */}
            <div className="space-y-4 pt-2 max-w-lg mx-auto lg:mx-0">
              <p className="text-[11px] sm:text-xs uppercase font-semibold tracking-[0.18em] text-slate-600">
                Crea tu enlace Tribio
              </p>

              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <span className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 font-medium text-sm sm:text-base whitespace-nowrap shrink-0">
                    tribio.info/
                  </span>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9\-_]/g, '')
                        )
                      }
                      placeholder="tu_negocio"
                      className={`w-full bg-transparent rounded-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all border ${getInputBorderClass()}`}
                    />

                    {slugStatus === 'checking' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {slugStatus === 'available' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {slugStatus === 'taken' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!isButtonEnabled}
                    onClick={handleSubmit}
                    className={`
                      sm:ml-1 px-5 py-2 rounded-full font-semibold text-sm transition
                      flex items-center justify-center gap-2 border
                      ${
                        !isButtonEnabled
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-200'
                          : 'bg-sky-600 text-white cursor-pointer border-sky-600 hover:bg-sky-700'
                      }
                    `}
                  >
                    <span>Empezar</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Mensajes de estado */}
                <div className="min-h-[18px]">
                  {slugStatus === 'available' && (
                    <p className="text-[11px] sm:text-xs text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Este enlace está disponible
                    </p>
                  )}
                  {slugStatus === 'taken' && (
                    <p className="text-[11px] sm:text-xs text-red-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Este enlace ya está ocupado
                    </p>
                  )}
                  {slugStatus === 'idle' && slug.length > 0 && slug.length < 3 && (
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      El enlace debe tener al menos 3 caracteres
                    </p>
                  )}
                  {slugStatus === 'checking' && (
                    <p className="text-[11px] sm:text-xs text-sky-600">
                      Verificando disponibilidad...
                    </p>
                  )}
                  {slugStatus === 'idle' && slug.length === 0 && (
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Perfecto para negocios, freelancers y equipos.
                    </p>
                  )}
                </div>
              </div>

              <button
                className="
                  mt-1 bg-sky-600 hover:bg-sky-700
                  text-white font-medium
                  w-full sm:w-auto
                  px-6 py-3 rounded-full
                  shadow-md shadow-sky-600/30
                  hover:shadow-lg hover:shadow-sky-600/50
                  transition
                  text-sm
                "
              >
                ¿Eres una empresa? — Solicita plan corporativo
              </button>
            </div>
          </div>

          {/* ============ DERECHA: CARRUSEL 3D (siempre después) ============ */}
          <div className="flex items-center justify-center lg:justify-end mt-4 md:mt-0">
            {/* Si quieres esconderlo en móvil: añade `hidden md:flex` en este div */}
            <div
              className="relative w-[260px] sm:w-[300px] md:w-[320px] h-[460px] sm:h-[520px] md:h-[540px]"
              style={{ perspective: '1500px' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${rotation}deg)`,
                }}
              >
                {IMAGES.map((src, index) => {
                  const angle = ROTATION_STEP * index;
                  const relative = (angle + rotation + 360) % 360;
                  const diff = Math.min(
                    Math.abs(relative),
                    Math.abs(360 - relative),
                  );
                  const isFront = diff < FRONT_THRESHOLD;
                  const blurAmount = isFront ? 0 : 10;
                  const opacity = isFront ? 1 : 0.15;
                  const scale = isFront ? 1 : 0.9;

                  return (
                    <div
                      key={index}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <img
                        src={src}
                        alt={`Negocio Tribio ${index + 1}`}
                        className="
                          w-[220px] sm:w-[240px] md:w-[260px]
                          h-[420px] sm:h-[470px] md:h-[500px]
                          object-cover rounded-[2rem]
                          shadow-[0_18px_45px_-12px_rgba(15,23,42,0.75)]
                          bg-transparent
                        "
                        style={{
                          filter: `blur(${blurAmount}px)`,
                          opacity,
                          transform: `scale(${scale})`,
                          transition:
                            'filter 300ms ease-out, opacity 300ms ease-out, transform 300ms ease-out',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

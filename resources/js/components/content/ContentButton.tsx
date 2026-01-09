import React, { useState } from 'react';
import { FaPlay, FaTimes, FaImage, FaVideo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';

interface ContentButtonProps {
  accountSlug: string;
  accentColor?: string;
  position?: 'left' | 'right';
}

/**
 * Botón flotante para acceder rápidamente al contenido multimedia
 * (Posts, Videos, Fotos) de la empresa
 */
export const ContentButton: React.FC<ContentButtonProps> = ({
  accountSlug,
  accentColor = '#fbbf24',
  position = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewContent = () => {
    // Navegar al feed de contenido estilo TikTok
    router.visit(`/${accountSlug}/content`);
    setIsOpen(false);
  };

  const positionClasses = position === 'left' ? 'left-4' : 'right-4';

  return (
    <>
      {/* Botón Principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 ${positionClasses} z-30 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95`}
        style={{ backgroundColor: accentColor }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 90, opacity: 1 }}
              exit={{ rotate: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes size={20} className="text-black" />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaPlay size={18} className="text-black ml-1" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Opciones Emergentes */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-40 ${positionClasses} z-29 flex flex-col gap-3`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Botón Ver Contenido */}
            <motion.button
              onClick={handleViewContent}
              className="flex items-center gap-3 bg-black/90 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-xl hover:bg-black transition-all duration-300 border border-white/10"
              whileHover={{ scale: 1.05, x: position === 'left' ? 5 : -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
                <FaVideo size={16} className="text-black" />
              </div>
              <div className="flex flex-col items-start pr-2">
                <span className="text-xs font-bold">Ver Videos</span>
                <span className="text-[10px] text-gray-400">y Contenido</span>
              </div>
            </motion.button>

            {/* Info Badge */}
            <motion.div
              className="bg-black/80 backdrop-blur-sm text-white text-[10px] px-3 py-2 rounded-lg border border-white/10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="font-medium">Descubre más</p>
              <p className="text-gray-400">contenido aquí</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ContentButton;

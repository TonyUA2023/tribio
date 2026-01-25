import React, { useState } from 'react';
import { FaShare } from 'react-icons/fa';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
  color?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url,
  className = '',
  iconSize = 20,
  showLabel = false,
  color = '#fff'
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title || document.title,
      text: text || document.title,
      url: url || window.location.href
    };

    // Verificar si el navegador soporta la Web Share API
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Usuario canceló o error
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 transition-all ${className}`}
      title={copied ? '¡Copiado!' : 'Compartir'}
      style={{ color }}
    >
      <FaShare size={iconSize} />
      {showLabel && (
        <span className="text-sm font-medium">
          {copied ? '¡Copiado!' : 'Compartir'}
        </span>
      )}
    </button>
  );
};

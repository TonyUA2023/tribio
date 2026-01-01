import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-left' | 'slide-right' | 'scale' | 'blur';
  delay?: number;
  className?: string;
  triggerOnce?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade',
  delay = 0,
  className = '',
  triggerOnce = true,
}) => {
  const { ref, isVisible } = useScrollAnimation({ triggerOnce });

  const animationClass = {
    fade: 'scroll-fade-in',
    'slide-left': 'scroll-slide-left',
    'slide-right': 'scroll-slide-right',
    scale: 'scroll-scale-up',
    blur: 'scroll-blur-in',
  }[animation];

  const delayClass = delay > 0 ? `delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={`${animationClass} ${delayClass} ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

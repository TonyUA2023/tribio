import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { ToastProvider } from './contexts/ToastContext';

// ✅ Marca fija del sistema (sin "Laravel" nunca)
const brandName = import.meta.env.VITE_APP_NAME?.trim() || 'TRIBIO';

createInertiaApp({
  // ✅ Template global: "Empresa | TRIBIO"
  title: (title) => (title ? `${title} | ${brandName}` : brandName),

  resolve: (name) =>
    resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),

  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <StrictMode>
        <ToastProvider>
          <App {...props} />
        </ToastProvider>
      </StrictMode>,
    );
  },

  progress: {
    color: '#4B5563',
  },
});

initializeTheme();

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade out after minimum display time
        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 1500);

        // Remove loading screen after fade out completes
        const removeTimer = setTimeout(() => {
            setIsLoading(false);
            document.body.classList.remove('overflow-hidden');
        }, 2000);

        // Prevent scrolling while loading
        document.body.classList.add('overflow-hidden');

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div
            className={`fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 transition-opacity duration-500 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            {/* Animated Gradient Orbs (matching Hero section) */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-l from-purple-400/25 to-pink-500/25 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1s' }}
                />
                <div
                    className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-tr from-orange-300/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '2s' }}
                />
                <div
                    className="absolute bottom-40 right-1/4 w-64 h-64 bg-gradient-to-bl from-pink-400/30 to-rose-500/30 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1.5s' }}
                />
            </div>

            {/* Logo and Loading Animation */}
            <div className="relative z-10 flex flex-col items-center space-y-8">
                {/* Logo */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 shadow-2xl shadow-purple-500/40 animate-pulse">
                    <svg
                        className="w-12 h-12 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                </div>

                {/* Brand Name */}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Tribio
                </h1>

                {/* Loading Spinner */}
                <div className="flex space-x-2">
                    <div
                        className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0s' }}
                    />
                    <div
                        className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                    />
                    <div
                        className="w-3 h-3 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                    />
                </div>

                {/* Loading Text */}
                <p className="text-sm text-gray-600 animate-pulse">
                    Cargando experiencia...
                </p>
            </div>
        </div>
    );
}

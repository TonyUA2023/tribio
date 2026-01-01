import { Toast, ToastProps } from './ui/toast';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastItem extends ToastProps {
    id: string;
}

interface ToastContextType {
    showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((toast: Omit<ToastProps, 'onClose'>) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback(
        (message: string, title?: string) => {
            showToast({ type: 'success', message, title: title || 'Éxito' });
        },
        [showToast],
    );

    const showError = useCallback(
        (message: string, title?: string) => {
            showToast({ type: 'error', message, title: title || 'Error' });
        },
        [showToast],
    );

    const showWarning = useCallback(
        (message: string, title?: string) => {
            showToast({ type: 'warning', message, title: title || 'Advertencia' });
        },
        [showToast],
    );

    const showInfo = useCallback(
        (message: string, title?: string) => {
            showToast({ type: 'info', message, title: title || 'Información' });
        },
        [showToast],
    );

    return (
        <ToastContext.Provider
            value={{ showToast, showSuccess, showError, showWarning, showInfo }}
        >
            {children}

            {/* Toast Container - Fixed en la esquina superior derecha */}
            <div
                aria-live="assertive"
                className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            {...toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
}

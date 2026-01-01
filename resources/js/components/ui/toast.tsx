import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps {
    type?: 'success' | 'error' | 'info' | 'warning';
    title?: string;
    message: string;
    onClose?: () => void;
}

export function Toast({ type = 'info', title, message, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) {
                setTimeout(onClose, 300);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            setTimeout(onClose, 300);
        }
    };

    const typeStyles = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-800 dark:text-green-200',
            icon: '✓',
            iconBg: 'bg-green-500',
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-800 dark:text-red-200',
            icon: '✗',
            iconBg: 'bg-red-500',
        },
        warning: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            text: 'text-yellow-800 dark:text-yellow-200',
            icon: '⚠',
            iconBg: 'bg-yellow-500',
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-800 dark:text-blue-200',
            icon: 'ℹ',
            iconBg: 'bg-blue-500',
        },
    };

    const styles = typeStyles[type];

    return (
        <div
            className={cn(
                'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300',
                styles.bg,
                styles.border,
                isVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0',
            )}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="shrink-0">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full text-white',
                                styles.iconBg,
                            )}
                        >
                            <span className="text-lg">{styles.icon}</span>
                        </div>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        {title && (
                            <p className={cn('text-sm font-medium', styles.text)}>
                                {title}
                            </p>
                        )}
                        <p className={cn('mt-1 text-sm', styles.text)}>{message}</p>
                    </div>
                    <div className="ml-4 flex shrink-0">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={cn(
                                'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                                styles.text,
                            )}
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

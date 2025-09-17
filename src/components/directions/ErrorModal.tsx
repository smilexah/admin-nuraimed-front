import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const ErrorModal: React.FC<{
    open: boolean;
    message: string;
    onClose: () => void;
}> = ({ open, message, onClose }) => {
    // lock scroll
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // esc to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', onKey, { capture: true });
        return () => document.removeEventListener('keydown', onKey, { capture: true });
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 pointer-events-none" />
            <div className="relative h-full w-full flex items-center justify-center">
                <div
                    className="relative bg-white w-96 max-w-md mx-auto rounded-lg shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Ошибка</h3>
                            <div className="mt-3 text-center">
                                <p className="text-sm text-gray-500">{message}</p>
                            </div>
                        </div>
                        <div className="mt-5">
                            <button
                                onClick={onClose}
                                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
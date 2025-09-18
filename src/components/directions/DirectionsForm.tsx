import React, {useEffect, useMemo, useState} from 'react';
import {TranslationFields} from './TranslationFields';
import type {Direction} from "../../types/directions.ts";
import {createPortal} from "react-dom";


export type FormTranslations = {
    ru: { title: string; description: string; offerDetails: string };
    kk: { title: string; description: string; offerDetails: string };
};

export type DirectionsFormValue = {
    translations: FormTranslations;
    images: File[];
    currentImage: string | null;
    removeCurrentImage: boolean;
};

const emptyForm: DirectionsFormValue = {
    translations: {
        ru: {title: '', description: '', offerDetails: ''},
        kk: {title: '', description: '', offerDetails: ''},
    },
    images: [],
    currentImage: null,
    removeCurrentImage: false,
};

export const DirectionsForm: React.FC<{
    initialDirection: Direction | null;
    onSubmit: (value: DirectionsFormValue) => Promise<void> | void;
    onCancel: () => void;
}> = ({initialDirection, onSubmit, onCancel}) => {
    const [value, setValue] = useState<DirectionsFormValue>(emptyForm);
    const [saving, setSaving] = useState(false);
    const isEdit = Boolean(initialDirection);

    useEffect(() => {
        if (!initialDirection) {
            setValue(emptyForm);
            return;
        }

        const base = structuredClone(emptyForm);
        base.currentImage = initialDirection.directionImage ?? null;

        initialDirection.translations.forEach((t) => {
            if (t.languageCode === 'ru' || t.languageCode === 'kk') {
                base.translations[t.languageCode] = {
                    title: t.title || '',
                    description: t.description || '',
                    offerDetails: t.offerDetails || '',
                } as FormTranslations[keyof FormTranslations];
            }
        });

        setValue(base);
    }, [initialDirection]);

    const canSubmit = useMemo(() => {
        const ru = value.translations.ru;
        const kk = value.translations.kk;
        if (!ru.title.trim()) return false;
        if (!ru.description.trim()) return false;
        if (!ru.offerDetails.trim()) return false;
        if (!kk.title.trim()) return false;
        if (!kk.description.trim()) return false;
        if (!kk.offerDetails.trim()) return false;
        return !(!isEdit && value.images.length === 0);
    }, [value, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSaving(true);
        try {
            await onSubmit(value);
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg md:text-xl font-semibold">
                            {isEdit ? 'Редактировать направление' : 'Новое направление'}
                        </h3>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 border-b pb-2">Русский язык</h4>
                            <TranslationFields
                                value={value.translations.ru}
                                onChange={(next) =>
                                    setValue((v) => ({...v, translations: {...v.translations, ru: next}}))
                                }
                            />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-900 border-b pb-2">Казахский язык</h4>
                            <TranslationFields
                                value={value.translations.kk}
                                onChange={(next) =>
                                    setValue((v) => ({...v, translations: {...v.translations, kk: next}}))
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-900 border-b pb-2">Изображение</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Выбрать новое изображение</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setValue((v) => ({...v, images: Array.from(e.target.files ?? [])}))
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all"
                                />
                                {value.images.length > 0 && (
                                    <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                        ✓ Выбрано: {value.images[0].name}
                                    </div>
                                )}
                            </div>

                            {isEdit && value.currentImage && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium mb-3 text-gray-700">Текущее изображение</label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                        <img
                                            src={`data:image/jpeg;base64,${value.currentImage}`}
                                            alt="Текущее изображение направления"
                                            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border shadow-sm"
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.src =
                                                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjQgMzZDMzAuNjI3NCAzNiAzNiAzMC42Mjc0IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3NCAxMiAyNCAxMkMxNy4zNzI2IDEyIDEyIDE3LjM3MjYgMTIgMjRDMTIgMzAuNjI3NiAxNy4zNzI2IDM2IDI0IDM2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setValue((v) => ({...v, currentImage: null, removeCurrentImage: true}))}
                                            className="flex items-center space-x-2 text-[#F59E2D] hover:text-[#F59E2D]/80 bg-[#F59E2D]/10 hover:bg-[#F59E2D]/20 px-3 py-2 rounded-md transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Удалить изображение</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t pt-4 -mx-4 -mb-6 px-4 md:-mx-6 md:px-6 pb-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit || saving}
                                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-[#2A5963] border border-transparent rounded-md hover:bg-[#2A5963]/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Сохранение...</span>
                                    </div>
                                ) : (
                                    'Сохранить'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
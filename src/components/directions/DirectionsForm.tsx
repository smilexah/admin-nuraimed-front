import React, {useEffect, useMemo, useState} from 'react';
import {TranslationFields} from './TranslationFields';
import type {Direction} from "../../types/directions.ts";


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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">
                {isEdit ? 'Редактировать направление' : 'Новое направление'}
            </h3>

            {/* Переводы */}
            <div className="grid gap-4 md:grid-cols-2">
                <TranslationFields
                    langLabel="Русский"
                    value={value.translations.ru}
                    onChange={(next) =>
                        setValue((v) => ({...v, translations: {...v.translations, ru: next}}))
                    }
                />
                <TranslationFields
                    langLabel="Казахский"
                    value={value.translations.kk}
                    onChange={(next) =>
                        setValue((v) => ({...v, translations: {...v.translations, kk: next}}))
                    }
                />
            </div>

            {/* Изображение */}
            <div>
                <label className="block text-sm font-medium mb-2">Изображение</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setValue((v) => ({...v, images: Array.from(e.target.files ?? [])}))
                    }
                    className="w-full p-2 border rounded"
                />
                {value.images.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">Выбрано: {value.images[0].name}</div>
                )}
            </div>

            {/* Текущее изображение при редактировании */}
            {isEdit && value.currentImage && (
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Текущее изображение</label>
                    <div className="flex items-center">
                        <img
                            src={`data:image/jpeg;base64,${value.currentImage}`}
                            alt="Текущее изображение направления"
                            className="w-16 h-16 object-cover rounded border mr-4"
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src =
                                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjQgMzZDMzAuNjI3NCAzNiAzNiAzMC42Mjc0IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3NCAxMiAyNCAxMkMxNy4zNzI2IDEyIDEyIDE3LjM3MjYgMTIgMjRDMTIgMzAuNjI3NiAxNy4zNzI2IDM2IDI0IDM2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setValue((v) => ({...v, currentImage: null, removeCurrentImage: true}))}
                            className="text-red-600 hover:text-red-900"
                        >
                            Удалить текущее изображение
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={!canSubmit || saving}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
};
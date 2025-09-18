import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Direction } from '../../types/directions';
import type { PageResponse } from '../../types/common';
import { create, deleteDirection, getAll, update } from '../../api/endpoints/directions';
import {getTranslation, isAxiosError} from "../../lib/getTranslation.ts";
import {DirectionsForm} from "./DirectionsForm.tsx";
import {DirectionsTable} from "./DirectionsTable.tsx";
import {Pagination} from "./Pagination.tsx";
import { ErrorModal } from "./ErrorModal.tsx";

export const DirectionsManager: React.FC = () => {
    const [directions, setDirections] = useState<Direction[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showForm, setShowForm] = useState(false);
    const [editingDirection, setEditingDirection] = useState<Direction | null>(null);

    const [error, setError] = useState<string | null>(null);

    const perPage = 10;

    const loadDirections = useCallback(async () => {
        setLoading(true);
        try {
            const response: PageResponse<Direction> = await getAll(currentPage, perPage);
            setDirections(response.content);
            setTotalPages(response.page.totalPages);
        } catch (err: unknown) {
            console.error('Ошибка загрузки направлений:', err);
            let userFriendlyMessage = 'Произошла ошибка при загрузке направлений';

            if (isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    userFriendlyMessage = 'Превышено время ожидания соединения с сервером. Проверьте интернет.';
                } else if (err.response?.status === 401) {
                    userFriendlyMessage = 'Превышено время ожидания соединения с сервером. Проверьте интернет.';
                } else if (err.response?.status === 403) {
                    userFriendlyMessage = 'Недостаточно прав для выполнения операции.';
                } else if (err.response?.status === 404) {
                    userFriendlyMessage = 'API endpoint не найден. Проверьте настройки сервера.';
                } else if (err.response?.status && err.response.status >= 500) {
                    userFriendlyMessage = 'Ошибка сервера. Попробуйте позже.';
                } else if (!navigator.onLine) {
                    userFriendlyMessage = 'Отсутствует подключение к интернету.';
                }
            }

            setError(userFriendlyMessage);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        loadDirections();
    }, [loadDirections]);

    const handleCreate = () => {
        setEditingDirection(null);
        setShowForm(true);
    };

    const handleEdit = (direction: Direction) => {
        setEditingDirection(direction);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить это направление?')) return;
        try {
            await deleteDirection(id);
            await loadDirections();
        } catch (e) {
            console.error('Ошибка удаления:', e);
            setError('Не удалось удалить направление. Попробуйте позже.');
        }
    };

    const closeForm = () => {
        setEditingDirection(null);
        setShowForm(false);
    };

    const tableRows = useMemo(
        () => directions.map((d) => {
            const translation = getTranslation(d);
            return {
                id: d.id,
                title: translation.title || 'Без названия',
                description: translation.description || 'Без описания',
                imageBase64: d.directionImage ?? null,
                raw: d,
            };
        }),
        [directions]
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <h2 className="text-xl md:text-2xl font-bold text-[#2A5963]">Управление направлениями</h2>
                <button
                    onClick={handleCreate}
                    className="w-full sm:w-auto bg-[#F59E2D] text-white px-4 py-2 rounded-md hover:bg-[#F59E2D]/90 transition-colors font-medium text-sm md:text-base"
                >
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Добавить направление</span>
                    </span>
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <DirectionsForm
                    initialDirection={editingDirection}
                    onCancel={closeForm}
                    onSubmit={async (form) => {
                        try {
                            const data = new FormData();

                            // translations
                            const langs = Object.keys(form.translations) as (keyof typeof form.translations)[];
                            langs.forEach((lang, i) => {
                                const t = form.translations[lang];
                                data.append(`translations[${i}].languageCode`, lang);
                                data.append(`translations[${i}].title`, t.title);
                                data.append(`translations[${i}].description`, t.description);
                                data.append(`translations[${i}].offerDetails`, t.offerDetails);
                            });

                            // image
                            if (form.images?.length) {
                                data.append('directionImage', form.images[0]);
                            } else if (form.removeCurrentImage) {
                                data.append('removeImage', 'true');
                            }

                            if (editingDirection) {
                                await update(editingDirection.id, data);
                            } else {
                                await create(data);
                            }

                            await loadDirections();
                            closeForm();
                        } catch (e) {
                            console.error('Ошибка сохранения:', e);
                            setError('Произошла ошибка при сохранении. Попробуйте еще раз.');
                        }
                    }}
                />
            )}

            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 md:p-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600">Загрузка направлений...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DirectionsTable
                            rows={tableRows}
                            onEdit={(row) => handleEdit(row.raw)}
                            onDelete={(row) => handleDelete(row.id)}
                        />

                        {totalPages > 1 && (
                            <Pagination
                                page={currentPage}
                                totalPages={totalPages}
                                onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                            />
                        )}
                    </>
                )}
            </div>

            <ErrorModal open={Boolean(error)} onClose={() => setError(null)} message={error ?? ''} />
        </div>
    );
};
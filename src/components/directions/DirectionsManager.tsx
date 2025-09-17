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
            setTotalPages(response.totalPages);
        } catch (err: unknown) {
            console.error('Ошибка загрузки направлений:', err);
            let userFriendlyMessage = 'Произошла ошибка при загрузке направлений';

            if (isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    userFriendlyMessage = 'Превышено время ожидания соединения с сервером. Проверьте интернет.';
                } else if (err.response?.status === 401) {
                    userFriendlyMessage = 'Ошибка авторизации. Пожалуйста, войдите в систему снова.';
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Управление направлениями</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Добавить направление
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow">
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
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                {loading ? (
                    <div className="p-6 text-center">Загрузка...</div>
                ) : (
                    <DirectionsTable
                        rows={tableRows}
                        onEdit={(row) => handleEdit(row.raw)}
                        onDelete={(row) => handleDelete(row.id)}
                    />
                )}

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t">
                        <Pagination
                            page={currentPage}
                            totalPages={totalPages}
                            onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        />
                    </div>
                )}
            </div>

            <ErrorModal open={Boolean(error)} onClose={() => setError(null)} message={error ?? ''} />
        </div>
    );
};
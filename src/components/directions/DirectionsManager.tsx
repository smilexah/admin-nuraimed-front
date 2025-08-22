import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Direction } from '../../types/directions.ts';
import type { PageResponse } from '../../types/common.ts';
import {create, deleteDirection, getAll, update} from "../../api/endpoints/directions.ts";

export const DirectionsManager: React.FC = () => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    translations: {
      ru: { title: '', description: '', offerDetails: '' },
      kk: { title: '', description: '', offerDetails: '' },
    },
    images: [] as File[],
    currentImage: null as string | null,
    removeCurrentImage: false
  });

  useEffect(() => {
    loadDirections();
  }, [currentPage]);

  useEffect(() => {
    if (showErrorModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showErrorModal]);

  useEffect(() => {
    if (!showErrorModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setShowErrorModal(false); }
    };
    document.addEventListener('keydown', onKey, { capture: true });
      return () => document.removeEventListener('keydown', onKey, { capture: true });
  }, [showErrorModal]);

  const loadDirections = async () => {
    setLoading(true);
    try {
      const response: PageResponse<Direction> = await getAll(currentPage, 10);
      setDirections(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Ошибка загрузки направлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTranslation = (direction: Direction, lang: string = 'ru') => {
    return direction.translations.find(t => t.languageCode === lang) ||
           direction.translations[0] ||
           { title: 'Без названия', description: 'Без описания' };
  };

  const validateForm = () => {
    const ruTranslation = formData.translations.ru;
    const kkTranslation = formData.translations.kk;

    if (!ruTranslation.title.trim()) {
      setErrorMessage('Поле "Название" на русском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!ruTranslation.description.trim()) {
      setErrorMessage('Поле "Описание" на русском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!ruTranslation.offerDetails.trim()) {
        setErrorMessage('Поле "Детали предложения" на русском языке обязательно для заполнения');
        setShowErrorModal(true);
        return false;
    }

    if (!kkTranslation.title.trim()) {
      setErrorMessage('Поле "Название" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!kkTranslation.description.trim()) {
      setErrorMessage('Поле "Описание" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!kkTranslation.offerDetails.trim()) {
      setErrorMessage('Поле "Детали предложения" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!editingDirection && formData.images.length === 0) {
      setErrorMessage('Необходимо загрузить изображение для направления');
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(formData.translations).forEach(([lang, translation]) => {
        if (translation.title || translation.description || translation.offerDetails) {
          const index = Object.keys(formData.translations).indexOf(lang);
          data.append(`translations[${index}].languageCode`, lang);
          data.append(`translations[${index}].title`, translation.title);
          data.append(`translations[${index}].description`, translation.description);
          data.append(`translations[${index}].offerDetails`, translation.offerDetails);
        }
      });

      if (formData.images.length > 0) {
        data.append('directionImage', formData.images[0]);
      } else if (formData.removeCurrentImage) {
        data.append('removeImage', 'true');
      }

      if (editingDirection) {
        await update(editingDirection.id, data);
      } else {
        await create(data);
      }

      await loadDirections();
      resetForm();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setErrorMessage('Произошла ошибка при сохранении. Попробуйте еще раз.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (direction: Direction) => {
    setEditingDirection(direction);

    const translationsData = {
      ru: { title: '', description: '', offerDetails: '' },
      kk: { title: '', description: '', offerDetails: '' },
    };

    direction.translations.forEach(translation => {
      if (translationsData[translation.languageCode as keyof typeof translationsData]) {
        translationsData[translation.languageCode as keyof typeof translationsData] = {
          title: translation.title || '',
          description: translation.description || '',
          offerDetails: translation.offerDetails || ''
        };
      }
    });

    setFormData({
      translations: translationsData,
      images: [],
      currentImage: direction.directionImage || null,
      removeCurrentImage: false
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это направление?')) {
      try {
        await deleteDirection(id);
        await loadDirections();
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      translations: {
        ru: { title: '', description: '', offerDetails: '' },
        kk: { title: '', description: '', offerDetails: '' },
      },
      images: [],
      currentImage: null,
      removeCurrentImage: false
    });
    setEditingDirection(null);
    setShowForm(false);
  };

  const handleRemoveCurrentImage = () => {
    setFormData(prev => ({
      ...prev,
      currentImage: null,
      removeCurrentImage: true
    }));
  };

  const handleTranslationChange = (lang: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang as keyof typeof prev.translations],
          [field]: value
        }
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files || [])
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление направлениями</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Добавить направление
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingDirection ? 'Редактировать направление' : 'Новое направление'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Переводы */}
            {Object.entries(formData.translations).map(([lang, translation]) => (
              <div key={lang} className="border p-4 rounded">
                <h4 className="font-medium mb-2">
                  {lang === 'ru' ? 'Русский' : 'Казахский'}
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Название"
                    value={translation.title}
                    onChange={(e) => handleTranslationChange(lang, 'title', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <textarea
                    placeholder="Описание"
                    value={translation.description}
                    onChange={(e) => handleTranslationChange(lang, 'description', e.target.value)}
                    className="w-full p-2 border rounded h-24"
                    required
                  />
                  <textarea
                    placeholder="Детали предложения"
                    value={translation.offerDetails}
                    onChange={(e) => handleTranslationChange(lang, 'offerDetails', e.target.value)}
                    className="w-full p-2 border rounded h-20"
                    required
                  />
                </div>
              </div>
            ))}

            {/* Изображение */}
            <div>
              <label className="block text-sm font-medium mb-2">Изображение</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
              />
              {formData.images.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Выбрано: {formData.images[0].name}
                </div>
              )}
            </div>

            {/* Текущее изображение */}
            {editingDirection && formData.currentImage && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Текущее изображение</label>
                <div className="flex items-center">
                  <img
                    src={`data:image/jpeg;base64,${formData.currentImage}`}
                    alt="Текущее изображение направления"
                    className="w-16 h-16 object-cover rounded border mr-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
                    }}
                  />
                  <button
                    onClick={handleRemoveCurrentImage}
                    className="text-red-600 hover:text-red-900"
                  >
                    Удалить текущее изображение
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список направлений */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Изображения</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {directions.map((direction) => {
                  const translation = getTranslation(direction);
                  return (
                    <tr key={direction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {direction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {translation.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {translation.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {direction.directionImage ? (
                          <img
                            src={`data:image/jpeg;base64,${direction.directionImage}`}
                            alt="Изображение направления"
                            className="w-12 h-12 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
                            }}
                          />
                        ) : (
                          <span className="text-gray-400">Нет изображения</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(direction)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(direction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              Предыдущая
            </button>
            <span className="text-sm text-gray-700">
              Страница {currentPage + 1} из {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              Следующая
            </button>
          </div>
        )}
      </div>

      {showErrorModal && createPortal(
          <div
              className="fixed inset-0 z-[10000]"
              onClick={() => setShowErrorModal(false)}
          >
            <div className="absolute inset-0 bg-black/70 pointer-events-none" />

            <div
                className="relative h-full w-full flex items-center justify-center"
            >
              <div
                  className="relative bg-white w-96 max-w-md mx-auto rounded-lg shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Ошибка</h3>
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-500">{errorMessage}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <button
                        onClick={() => setShowErrorModal(false)}
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
      )}
    </div>
  );
};

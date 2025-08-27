import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Doctor } from '../../types/doctors.ts';
import type { PageResponse } from '../../types/common.ts';
import {create, deleteDoctor, getAll, update} from "../../api/endpoints/doctors.ts";

interface AxiosError {
  code?: string;
  response?: {
    status?: number;
  };
}

const isAxiosError = (error: unknown): error is AxiosError => {
  return typeof error === 'object' && error !== null;
};

export const DoctorsManager: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    translations: {
      ru: { description: '', education: '', experience: '', serviceRecord: '', specialization: '' },
      kk: { description: '', education: '', experience: '', serviceRecord: '', specialization: '' },
    },
    images: [] as File[],
    currentImage: null as string | null,
    removeCurrentImage: false
  });

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const response: PageResponse<Doctor> = await getAll(currentPage, 10);
      setDoctors(response.content);
      setTotalPages(response.totalPages);
    } catch (error: unknown) {
      console.error('Ошибка загрузки врачей:', error);

      let userFriendlyMessage = 'Произошла ошибка при загрузке врачей';

      if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          userFriendlyMessage = 'Превышено время ожидания соединения с сервером. Проверьте подключение к интернету или попробуйте позже.';
        } else if (error.response?.status === 401) {
          userFriendlyMessage = 'Ошибка авторизации. Пожалуйста, войдите в систему снова.';
        } else if (error.response?.status === 403) {
          userFriendlyMessage = 'Недостаточно прав для выполнения операции.';
        } else if (error.response?.status === 404) {
          userFriendlyMessage = 'API endpoint не найден. Проверьте настройки сервера.';
        } else if (error.response?.status && error.response.status >= 500) {
          userFriendlyMessage = 'Ошибка сервера. Попробуйте позже.';
        } else if (!navigator.onLine) {
          userFriendlyMessage = 'Отсутствует подключение к интернету.';
        }
      }

      setErrorMessage(userFriendlyMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (showErrorModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showErrorModal]);

  const getTranslation = (doctor: Doctor, lang: string = 'ru') => {
    return doctor.translations.find(t => t.languageCode === lang) ||
           doctor.translations[0] ||
           { specialization: 'Без специализации', description: 'Без описания' };
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setErrorMessage('Поле "Имя" обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!formData.lastName.trim()) {
      setErrorMessage('Поле "Фамилия" обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    const ruTranslation = formData.translations.ru;
    const kkTranslation = formData.translations.kk;

    if (!ruTranslation.specialization.trim()) {
      setErrorMessage('Поле "Специализация" на русском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!ruTranslation.description.trim()) {
      setErrorMessage('Поле "Описание" на русском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!ruTranslation.education.trim()) {
      setErrorMessage('Поле "Образование" на русском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!ruTranslation.experience.trim()) {
      setErrorMessage('Поле "Опыт работы" на русском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!ruTranslation.serviceRecord.trim()) {
      setErrorMessage('Поле "Стаж работы" на русском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!kkTranslation.specialization.trim()) {
      setErrorMessage('Поле "Специализация" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!kkTranslation.description.trim()) {
      setErrorMessage('Поле "Описание" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!kkTranslation.education.trim()) {
      setErrorMessage('Поле "Образование" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!kkTranslation.experience.trim()) {
      setErrorMessage('Поле "Опыт работы" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!kkTranslation.serviceRecord.trim()) {
      setErrorMessage('Поле "Стаж работы" на казахском языке обязательно для заполнения');
      setShowErrorModal(true);
      return false;
    }

    if (!editingDoctor && formData.images.length === 0) {
      setErrorMessage('Необходимо загрузить изображение профиля врача');
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

      // Добавляем основные поля
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('middleName', formData.middleName);

      // Добавляем переводы как отдельные поля вместо JSON строки
      Object.entries(formData.translations).forEach(([lang, translation]) => {
        if (translation.description || translation.education || translation.experience ||
            translation.serviceRecord || translation.specialization) {
          const index = Object.keys(formData.translations).indexOf(lang);
          data.append(`translations[${index}].languageCode`, lang);
          data.append(`translations[${index}].description`, translation.description);
          data.append(`translations[${index}].education`, translation.education);
          data.append(`translations[${index}].experience`, translation.experience);
          data.append(`translations[${index}].serviceRecord`, translation.serviceRecord);
          data.append(`translations[${index}].specialization`, translation.specialization);
        }
      });

      // Добавляем изображение (только одно)
      if (formData.images.length > 0) {
        data.append('profileImage', formData.images[0]);
      } else if (formData.removeCurrentImage) {
        // Если нужно удалить текущее изображение, отправляем пустое значение
        data.append('removeImage', 'true');
      }

      if (editingDoctor) {
        await update(editingDoctor.id, data);
      } else {
        await create(data);
      }

      await loadDoctors();
      resetForm();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setErrorMessage('Произошла ошибка при сохранении. Попробуйте еще раз.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);

    // Заполняем форму данными для редактирования
    const translationsData = {
      ru: { description: '', education: '', experience: '', serviceRecord: '', specialization: '' },
      kk: { description: '', education: '', experience: '', serviceRecord: '', specialization: '' },
    };

    doctor.translations.forEach(translation => {
      if (translationsData[translation.languageCode as keyof typeof translationsData]) {
        translationsData[translation.languageCode as keyof typeof translationsData] = {
          description: translation.description || '',
          education: translation.education || '',
          experience: translation.experience || '',
          serviceRecord: translation.serviceRecord || '',
          specialization: translation.specialization || ''
        };
      }
    });

    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      middleName: doctor.middleName,
      translations: translationsData,
      images: [],
      currentImage: doctor.profileImage || null,
      removeCurrentImage: false
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого врача?')) {
      try {
        await deleteDoctor(id);
        await loadDoctors();
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      translations: {
        ru: { description: '', education: '', experience: '', serviceRecord: '', specialization: '' },
        kk: { description: '', education: '', experience: '', serviceRecord: '', specialization: '' },
      },
      images: [],
      currentImage: null,
      removeCurrentImage: false
    });
    setEditingDoctor(null);
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
        <h2 className="text-2xl font-bold">Управление врачами</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Добавить врача
        </button>
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

      {/* Форма */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingDoctor ? 'Редактировать врача' : 'Новый врач'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Основные поля */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Фамилия *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Отчество</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Переводы */}
            {Object.entries(formData.translations).map(([lang, translation]) => (
              <div key={lang} className="border p-4 rounded">
                <h4 className="font-medium mb-2">
                  {lang === 'ru' ? 'Русский' : 'Казахский'}
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Специализация"
                    value={translation.specialization}
                    onChange={(e) => handleTranslationChange(lang, 'specialization', e.target.value)}
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
                    placeholder="Образование"
                    value={translation.education}
                    onChange={(e) => handleTranslationChange(lang, 'education', e.target.value)}
                    className="w-full p-2 border rounded h-20"
                    required
                  />
                  <textarea
                    placeholder="Опыт работы"
                    value={translation.experience}
                    onChange={(e) => handleTranslationChange(lang, 'experience', e.target.value)}
                    className="w-full p-2 border rounded h-20"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Стаж работы"
                    value={translation.serviceRecord}
                    onChange={(e) => handleTranslationChange(lang, 'serviceRecord', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
            ))}

            {/* Изображение */}
            <div>
              <label className="block text-sm font-medium mb-2">Фото профиля</label>
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
            {editingDoctor && formData.currentImage && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Текущее фото</label>
                <div className="flex items-center">
                  <img
                    src={`data:image/jpeg;base64,${formData.currentImage}`}
                    alt="Текущее фото врача"
                    className="w-16 h-16 object-cover rounded border mr-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCurrentImage}
                    className="text-red-600 hover:text-red-900"
                  >
                    Удалить текущее фото
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

      {/* Список врачей */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Специализация</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Фото</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => {
                  const translation = getTranslation(doctor);
                  return (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doctor.lastName} {doctor.firstName} {doctor.middleName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {translation.specialization}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {translation.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.profileImage ? (
                          <img
                            src={`data:image/jpeg;base64,${doctor.profileImage}`}
                            alt="Фото врача"
                            className="w-12 h-12 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
                            }}
                          />
                        ) : (
                          <span className="text-gray-400">Нет фото</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
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

            {doctors.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                Врачей пока нет
              </div>
            )}

            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Предыдущая
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Следующая
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Страница <span className="font-medium">{currentPage + 1}</span> из{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


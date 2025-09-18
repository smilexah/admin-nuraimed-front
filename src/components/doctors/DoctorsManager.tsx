import React, {useState, useEffect, useCallback} from 'react';
import {createPortal} from 'react-dom';
import type {Doctor} from '../../types/doctors.ts';
import type {PageResponse} from '../../types/common.ts';
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
            ru: {description: '', education: '', experience: '', serviceRecord: '', specialization: ''},
            kk: {description: '', education: '', experience: '', serviceRecord: '', specialization: ''},
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
            setTotalPages(response.page.totalPages);
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
        void loadDoctors();
    }, [loadDoctors]);

    useEffect(() => {
        if (showErrorModal) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [showErrorModal]);

    const getTranslation = (doctor: Doctor, lang: string = 'ru') => {
        return doctor.translations.find(t => t.languageCode === lang) ||
            doctor.translations[0] ||
            {specialization: 'Без специализации', description: 'Без описания'};
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

        const requiredFields = [
            {field: ruTranslation.specialization, name: 'Специализация', lang: 'русском'},
            {field: ruTranslation.description, name: 'Описание', lang: 'русском'},
            {field: ruTranslation.education, name: 'Образование', lang: 'русском'},
            {field: ruTranslation.experience, name: 'Опыт работы', lang: 'русском'},
            {field: ruTranslation.serviceRecord, name: 'Стаж работы', lang: 'русском'},
            {field: kkTranslation.specialization, name: 'Специализация', lang: 'казахском'},
            {field: kkTranslation.description, name: 'Описание', lang: 'казахском'},
            {field: kkTranslation.education, name: 'Образование', lang: 'казахском'},
            {field: kkTranslation.experience, name: 'Опыт работы', lang: 'казахском'},
            {field: kkTranslation.serviceRecord, name: 'Стаж работы', lang: 'казахском'},
        ];

        for (const {field, name, lang} of requiredFields) {
            if (!field.trim()) {
                setErrorMessage(`Поле "${name}" на ${lang} языке обязательно для заполнения`);
                setShowErrorModal(true);
                return false;
            }
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

            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('middleName', formData.middleName);

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

            if (formData.images.length > 0) {
                data.append('profileImage', formData.images[0]);
            } else if (formData.removeCurrentImage) {
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

        const translationsData = {
            ru: {description: '', education: '', experience: '', serviceRecord: '', specialization: ''},
            kk: {description: '', education: '', experience: '', serviceRecord: '', specialization: ''},
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
                ru: {description: '', education: '', experience: '', serviceRecord: '', specialization: ''},
                kk: {description: '', education: '', experience: '', serviceRecord: '', specialization: ''},
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
        <div className="space-y-4 md:space-y-6">
            {/* Header Section */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <h2 className="text-xl md:text-2xl font-bold text-[#2A5963]">Управление врачами</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-[#F59E2D] text-white px-4 py-2 rounded-md hover:bg-[#F59E2D]/90 transition-colors font-medium text-sm md:text-base"
                >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            <span>Добавить врача</span>
          </span>
                </button>
            </div>

            {/* Error Modal */}
            {showErrorModal && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowErrorModal(false)}/>
                    <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col items-center">
                                <div
                                    className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
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
                                    className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg md:text-xl font-semibold">
                                    {editingDoctor ? 'Редактировать врача' : 'Новый врач'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                            {/* Основные поля */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 border-b pb-2">Основная информация</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                firstName: e.target.value
                                            }))}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия
                                            *</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Отчество</label>
                                        <input
                                            type="text"
                                            value={formData.middleName}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                middleName: e.target.value
                                            }))}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Переводы */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {Object.entries(formData.translations).map(([lang, translation]) => (
                                    <div key={lang} className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                                            {lang === 'ru' ? 'Русский язык' : 'Казахский язык'}
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(translation).map(([field, value]) => (
                                                <div key={field}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {field === 'specialization' && 'Специализация *'}
                                                        {field === 'description' && 'Описание *'}
                                                        {field === 'education' && 'Образование *'}
                                                        {field === 'experience' && 'Опыт работы *'}
                                                        {field === 'serviceRecord' && 'Стаж работы *'}
                                                    </label>
                                                    {field === 'description' ? (
                                                        <textarea
                                                            value={value}
                                                            onChange={(e) => handleTranslationChange(lang, field, e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm resize-none"
                                                            rows={4}
                                                            required
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={value}
                                                            onChange={(e) => handleTranslationChange(lang, field, e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm"
                                                            required
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Изображение */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 border-b pb-2">Фото профиля</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Выбрать новое
                                            изображение</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all"
                                        />
                                        {formData.images.length > 0 && (
                                            <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                                ✓ Выбрано: {formData.images[0].name}
                                            </div>
                                        )}
                                    </div>

                                    {editingDoctor && formData.currentImage && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium mb-3 text-gray-700">Текущее
                                                изображение</label>
                                            <div
                                                className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                                <img
                                                    src={`data:image/jpeg;base64,${formData.currentImage}`}
                                                    alt="Фото врача"
                                                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveCurrentImage}
                                                    className="flex items-center space-x-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                         viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                    </svg>
                                                    <span>Удалить изображение</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div
                                className="sticky bottom-0 bg-white border-t pt-4 -mx-4 -mb-6 px-4 md:-mx-6 md:px-6 pb-6">
                                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-[#2A5963] border border-transparent rounded-md hover:bg-[#2A5963]/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                </div>
            )}

            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 md:p-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600">Загрузка врачей...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Фото</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Специализация</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {doctors.map((doctor) => {
                                    const translation = getTranslation(doctor);
                                    return (
                                        <tr key={doctor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {doctor.profileImage ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${doctor.profileImage}`}
                                                        alt="Фото врача"
                                                        className="w-12 h-12 object-cover rounded-full border"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none"
                                                             stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {doctor.lastName} {doctor.firstName} {doctor.middleName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {translation.specialization}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(doctor)}
                                                    className="text-[#2A5963] hover:text-[#2A5963]/80"
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doctor.id)}
                                                    className="text-red-600 hover:text-red-700"
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

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4 p-4">
                            {doctors.map((doctor) => {
                                const translation = getTranslation(doctor);
                                return (
                                    <div key={doctor.id} className="bg-white rounded-lg shadow border p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                        <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ID: {doctor.id}
                        </span>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4 mb-4">
                                            <div className="flex-shrink-0">
                                                {doctor.profileImage ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${doctor.profileImage}`}
                                                        alt="Фото врача"
                                                        className="w-16 h-16 object-cover rounded-full border shadow-sm"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none"
                                                             stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 mb-1 break-words">
                                                    {doctor.lastName} {doctor.firstName} {doctor.middleName}
                                                </h3>
                                                <p className="text-sm text-gray-600 break-words">{translation.specialization}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                            <button
                                                onClick={() => handleEdit(doctor)}
                                                className="flex-1 bg-[#2A5963] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2A5963]/90 transition-colors"
                                            >
                                                Редактировать
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doctor.id)}
                                                className="flex-1 bg-[#F59E2D] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#F59E2D]/80 transition-colors"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {doctors.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <div className="mb-4">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </div>
                                <p className="text-lg font-medium">Врачей пока нет</p>
                                <p className="text-sm text-gray-400 mt-1">Добавьте первого врача, чтобы начать
                                    работу</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div
                                className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-white px-4 py-3 border-t border-gray-200">
                                <div className="flex items-center text-sm text-gray-700">
                                    <span className="hidden sm:inline">Показано страница </span>
                                    <span className="font-medium mx-1">{currentPage + 1}</span>
                                    <span>из</span>
                                    <span className="font-medium mx-1">{totalPages}</span>
                                    <span className="hidden sm:inline"> страниц</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M15 19l-7-7 7-7"/>
                                        </svg>
                                        <span className="hidden sm:inline">Предыдущая</span>
                                        <span className="sm:hidden">Пред</span>
                                    </button>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="hidden sm:inline">Следующая</span>
                                        <span className="sm:hidden">След</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

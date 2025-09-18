import React, {useState, useEffect, useCallback} from 'react';
import type {Review} from '../../types/reviews.ts';
import type {PageResponse} from '../../types/common.ts';
import {deleteReview, getAll, updateReviewStatus} from "../../api/endpoints/reviews.ts";

export const ReviewsManager: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response: PageResponse<Review> = await getAll(currentPage, 10);
            setReviews(response.content);
            const totalPagesValue = response.page?.totalPages || response.totalPages || 0;
            setTotalPages(totalPagesValue);
            const totalElements = response.page?.totalElements || response.totalElements || 0;
            setTotalReviews(totalElements);
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить отзыв?')) {
            try {
                await deleteReview(id);
                loadReviews();
            } catch (error) {
                console.error('Ошибка удаления:', error);
            }
        }
    };

    const handleTogglePublish = async (review: Review) => {
        try {
            await updateReviewStatus(review.id, !review.isPublished);
            loadReviews();
        } catch (error) {
            console.error('Ошибка изменения статуса:', error);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <h2 className="text-xl md:text-2xl font-bold text-[#2A5963]">Управление отзывами</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Всего отзывов: {totalReviews}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 md:p-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600">Загрузка отзывов...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop List View */}
                        <div className="hidden md:block">
                            <ul className="divide-y divide-gray-200">
                                {reviews.map((review) => (
                                    <li key={review.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-medium text-gray-900 truncate">{review.name}</h3>
                                                    {review.phone && (
                                                        <span className="text-sm text-gray-500 flex-shrink-0">({review.phone})</span>
                                                    )}
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                                                            review.isPublished
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        {review.isPublished ? 'Опубликован' : 'На модерации'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-2 break-words">{review.message}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="ml-6 flex flex-col space-y-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleTogglePublish(review)}
                                                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                        review.isPublished
                                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    }`}
                                                >
                                                    {review.isPublished ? 'Скрыть' : 'Опубликовать'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow border p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-medium text-gray-900">{review.name}</h3>
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    review.isPublished
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {review.isPublished ? 'Опубликован' : 'На модерации'}
                                            </span>
                                        </div>
                                    </div>

                                    {review.phone && (
                                        <p className="text-sm text-gray-500 mb-2">Телефон: {review.phone}</p>
                                    )}

                                    <p className="text-gray-600 mb-3 break-words">{review.message}</p>

                                    <p className="text-sm text-gray-500 mb-4">
                                        {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>

                                    <div className="flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleTogglePublish(review)}
                                            className={`w-full px-4 py-2 text-sm font-medium rounded transition-colors ${
                                                review.isPublished
                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                            }`}
                                        >
                                            {review.isPublished ? 'Скрыть отзыв' : 'Опубликовать отзыв'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="w-full bg-[#F59E2D] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#F59E2D]/80 transition-colors"
                                        >
                                            Удалить отзыв
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {reviews.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500">
                                <div className="mb-4">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium">Отзывов пока нет</p>
                                <p className="text-sm text-gray-400 mt-1">Отзывы будут отображаться здесь после их получения</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-white px-4 py-3 border-t border-gray-200">
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
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

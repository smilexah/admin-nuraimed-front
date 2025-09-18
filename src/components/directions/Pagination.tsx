import React from 'react';

export const Pagination: React.FC<{
    page: number; // zero-based
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}> = ({ page, totalPages, onPrev, onNext }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
                <span className="hidden sm:inline">Показано страница </span>
                <span className="font-medium mx-1">{page + 1}</span>
                <span>из</span>
                <span className="font-medium mx-1">{totalPages}</span>
                <span className="hidden sm:inline"> страниц</span>
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={onPrev}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Предыдущая</span>
                    <span className="sm:hidden">Пред</span>
                </button>

                <button
                    onClick={onNext}
                    disabled={page === totalPages - 1}
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
    );
};

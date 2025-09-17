import React from 'react';

export const Pagination: React.FC<{
    page: number; // zero-based
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}> = ({ page, totalPages, onPrev, onNext }) => {
    return (
        <div className="flex justify-between items-center">
            <button
                onClick={onPrev}
                disabled={page === 0}
                className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
                Предыдущая
            </button>
            <span className="text-sm text-gray-700">
        Страница {page + 1} из {totalPages}
      </span>
            <button
                onClick={onNext}
                disabled={page === totalPages - 1}
                className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
                Следующая
            </button>
        </div>
    );
};

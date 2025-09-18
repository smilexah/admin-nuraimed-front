import React from 'react';
import type {Direction} from '../../types/directions';

export type DirectionsRow = {
    id: number;
    title: string;
    description: string;
    imageBase64: string | null;
    // raw direction kept by parent if needed
    raw: Direction; // Изменяем с unknown на Direction для типобезопасности
};

export const DirectionsTable: React.FC<{
    rows: DirectionsRow[];
    onEdit: (row: DirectionsRow) => void;
    onDelete: (row: DirectionsRow) => void;
}> = ({rows, onEdit, onDelete}) => {
    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
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
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{row.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {row.imageBase64 ? (
                                    <img
                                        src={`data:image/jpeg;base64,${row.imageBase64}`}
                                        alt="Изображение направления"
                                        className="w-12 h-12 object-cover rounded border"
                                        onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            target.src =
                                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjQgMzZDMzAuNjI3NCAzNiAzNiAzMC42Mjc0IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3NCAxMiAyNCAxMkMxNy4zNzI2IDEyIDEyIDE3LjM3MjYgMTIgMjRDMTIgMzAuNjI3NiAxNy4zNzI2IDM2IDI0IDM2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
                                        }}
                                    />
                                ) : (
                                    <span className="text-gray-400">Нет изображения</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button onClick={() => onEdit(row)} className="text-[#2A5963] hover:text-[#2A5963]/80">
                                    Редактировать
                                </button>
                                <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-700">
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {rows.map((row) => (
                    <div key={row.id} className="bg-white rounded-lg shadow border p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    ID: {row.id}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 mb-4">
                            <div className="flex-shrink-0">
                                {row.imageBase64 ? (
                                    <img
                                        src={`data:image/jpeg;base64,${row.imageBase64}`}
                                        alt="Изображение направления"
                                        className="w-16 h-16 object-cover rounded border"
                                        onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            target.src =
                                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjQgMzZDMzAuNjI3NCAzNiAzNiAzMC42Mjc0IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3NCAxMiAyNCAxMkMxNy4zNzI2IDEyIDEyIDE3LjM3MjYgMTIgMjRDMTIgMzAuNjI3NiAxNy4zNzI2IDM2IDI0IDM2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0yMSAyMUwyNyAyN00yNyAyMUwyMSAyNyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
                                        }}
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                        <span className="text-xs text-gray-400">Нет фото</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-900 mb-1 break-words">{row.title}</h3>
                                <p className="text-sm text-gray-600 break-words">{row.description}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => onEdit(row)}
                                className="flex-1 bg-[#2A5963] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2A5963]/90 transition-colors"
                            >
                                Редактировать
                            </button>
                            <button
                                onClick={() => onDelete(row)}
                                className="flex-1 bg-[#F59E2D] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#F59E2D]/80 transition-colors"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {rows.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">Направлений пока нет</p>
                    <p className="text-sm text-gray-400 mt-1">Создайте первое направление, чтобы начать работу</p>
                </div>
            )}
        </div>
    );
};
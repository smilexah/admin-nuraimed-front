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
                            <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-900">
                                Редактировать
                            </button>
                            <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-900">
                                Удалить
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {rows.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Направлении пока нет
                </div>
            )}
        </div>
    );
};
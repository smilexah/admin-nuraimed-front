import React from 'react';

type T = { title: string; description: string; offerDetails: string };

export const TranslationFields: React.FC<{
    value: T;
    onChange: (next: T) => void;
}> = ({ value, onChange }) => {
    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Название *
                    </label>
                    <input
                        type="text"
                        placeholder="Введите название направления"
                        value={value.title}
                        onChange={(e) => onChange({ ...value, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание *
                    </label>
                    <textarea
                        placeholder="Введите описание направления"
                        value={value.description}
                        onChange={(e) => onChange({ ...value, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm resize-none"
                        rows={4}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Детали предложения *
                    </label>
                    <textarea
                        placeholder="Введите детали предложения"
                        value={value.offerDetails}
                        onChange={(e) => onChange({ ...value, offerDetails: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F59E2D] focus:border-[#F59E2D] transition-all text-sm resize-none"
                        rows={3}
                        required
                    />
                </div>
            </div>
        </div>
    );
};
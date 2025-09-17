import React from 'react';

type T = { title: string; description: string; offerDetails: string };

export const TranslationFields: React.FC<{
    langLabel: string;
    value: T;
    onChange: (next: T) => void;
}> = ({ langLabel, value, onChange }) => {
    return (
        <div className="border p-4 rounded">
            <h4 className="font-medium mb-2">{langLabel}</h4>
            <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Название"
                    value={value.title}
                    onChange={(e) => onChange({ ...value, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
                <textarea
                    placeholder="Описание"
                    value={value.description}
                    onChange={(e) => onChange({ ...value, description: e.target.value })}
                    className="w-full p-2 border rounded h-24"
                    required
                />
                <textarea
                    placeholder="Детали предложения"
                    value={value.offerDetails}
                    onChange={(e) => onChange({ ...value, offerDetails: e.target.value })}
                    className="w-full p-2 border rounded h-20"
                    required
                />
            </div>
        </div>
    );
};
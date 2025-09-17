import type {Direction} from "../types/directions.ts";

export const getTranslation = (direction: Direction, lang: string = 'ru') => {
    return (
        direction.translations.find((t) => t.languageCode === lang) ||
        direction.translations[0] || {title: 'Без названия', description: 'Без описания'}
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// File: src/features/directions/lib/isAxiosError.ts
// Utility: type guard for Axios-like errors
// ─────────────────────────────────────────────────────────────────────────────
export interface AxiosErrorLike {
    code?: string;
    response?: { status?: number };
}

export const isAxiosError = (error: unknown): error is AxiosErrorLike =>
    typeof error === 'object' && error !== null && 'response' in (error as Record<string, unknown>);

import {api} from "../api.ts";
import {clearAccessToken, setAccessToken} from "../utils/tokenUtils.ts";
import type {IAuthRequest, IAuthResponse} from "../../types/auth.ts";

export const login = async (auth: IAuthRequest): Promise<IAuthResponse> => {
    const response = await api.post("/auth/login", {username: auth.username, password: auth.password});

    const {accessToken} = response.data;

    // Сохраняем только accessToken, refresh token автоматически устанавливается в HttpOnly cookie
    setAccessToken(accessToken);

    return response.data;
}

export const refreshToken = async (): Promise<IAuthResponse> => {
    // Refresh token автоматически берется из cookie, не требует заголовка Authorization
    const response = await api.post("/auth/refresh-token");

    const {accessToken} = response.data;
    setAccessToken(accessToken);

    return response.data;
}

export const logout = async () => {
    try {
        // Отправляем запрос на logout (токен автоматически добавляется в interceptor)
        await api.post("/auth/logout");
    } catch (error) {
        console.warn('Logout error:', error);
    } finally {
        // Всегда очищаем токены, даже если запрос на сервер не удался
        clearAccessToken();
    }
}

import {api} from "../api.ts";
import {clearAccessToken, setAccessToken} from "../utils/tokenUtils.ts";
import type {IAuthRequest, IAuthResponse} from "../../types/auth.ts";

export const login = async (auth: IAuthRequest): Promise<IAuthResponse> => {
    try {
        const response = await api.post("/auth/login", {username: auth.username, password: auth.password});

        const {accessToken} = response.data;

        if (!accessToken) {
            throw new Error('Access token not received from login endpoint');
        }

        // Сохраняем только accessToken, refresh token автоматически устанавливается в HttpOnly cookie
        setAccessToken(accessToken);

        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

export const logout = async () => {
    try {
        await api.post("/auth/logout");
    } catch (error) {
        console.warn('Logout error:', error);
    } finally {
        clearAccessToken();
    }
}

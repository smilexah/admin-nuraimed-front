import {api} from "../api.ts";
import {clearTokens, setTokens} from "../utils/tokenUtils.ts";
import type {IAuthRequest, IAuthResponse} from "../../types/auth.ts";

export const login = async (auth: IAuthRequest): Promise<IAuthResponse> => {
    const response = await api.post("/auth/login", {username: auth.username, password: auth.password});

    const {accessToken, refreshToken} = response.data;

    setTokens(accessToken, refreshToken);

    return response.data;
}

export const logout = async (token: string) => {
    const response = await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
        clearTokens();
    }

    return response.data;
}

import axios, {type AxiosRequestConfig, type InternalAxiosRequestConfig} from "axios";
import {clearAccessToken, getAccessToken, setAccessToken} from "./utils/tokenUtils.ts";

type FailedRequest = {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
};

let failedQueue: FailedRequest[] = [];
let isRefreshing = false;

const processQueue = (error: unknown, token?: string) => {
    failedQueue.forEach(p => {
        if (error || !token) p.reject(error ?? new Error("Token missing"));
        else p.resolve(token);
    });
    failedQueue = [];
};

// расширяем тип конфигурации (чтобы не ругался TS на _retry)
declare module "axios" {
    interface AxiosRequestConfig {
        _retry?: boolean;
    }
}

export const api = axios.create({
    baseURL: "http://localhost:8080/api", // https://api.di-clinic.kz/api
    withCredentials: true,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as any).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {};
        const status = error?.response?.status;
        const isRefreshCall = originalRequest?.url?.includes("/auth/refresh-token");

        if (status === 401 && !originalRequest._retry && !isRefreshCall) {
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers = originalRequest.headers ?? {};
                        (originalRequest.headers as any).Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // без body — сервер сам читает refresh из httpOnly cookie
                const resp = await api.post("/auth/refresh-token", null, { withCredentials: true });

                const { accessToken } = resp.data ?? {};
                if (!accessToken) throw new Error("No accessToken in refresh response");

                setAccessToken(accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);

                originalRequest.headers = originalRequest.headers ?? {};
                (originalRequest.headers as any).Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, undefined);
                clearAccessToken();
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        if (status === 401 && isRefreshCall) {
            // refresh тоже не прошёл — уводим на логин
            clearAccessToken();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);
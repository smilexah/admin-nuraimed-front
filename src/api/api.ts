import axios from "axios";
import {getAccessToken, setAccessToken, clearAccessToken} from "./utils/tokenUtils.ts";

type FailedRequest = {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
};

let failedQueue: FailedRequest[] = [];
let isRefreshing = false;

const processQueue = (error: unknown, token?: string) => {
    failedQueue.forEach(p => {
        if (error || !token) {
            p.reject(error ?? new Error("Token missing"));
        } else {
            p.resolve(token);
        }
    });
    failedQueue = [];
};

export const api = axios.create({
    baseURL: "http://localhost:8080/api", // https://api.di-clinic.kz/api
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        // Не добавляем токен только для эндпоинта login
        const publicEndpoints = ['/auth/login'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (!isPublicEndpoint) {
            const token = getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Не пытаемся обновлять токены для эндпоинта login
        const isLoginEndpoint = originalRequest.url?.includes('/auth/login');

        if (error.response?.status === 401 && !originalRequest._retry && !isLoginEndpoint) {
            // Если это ошибка 401 на refresh-token эндпоинте, значит refresh token истек
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                clearAccessToken();
                if (window.location.pathname !== '/login') {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Refresh token автоматически берется из HttpOnly cookie
                const response = await api.post("/auth/refresh-token");
                const {accessToken} = response.data;

                setAccessToken(accessToken);

                // Обновляем заголовок для повторного запроса
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, undefined);
                clearAccessToken();

                // Перенаправляем на страницу входа только если это не уже страница входа
                if (window.location.pathname !== '/login') {
                    window.location.href = "/login";
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
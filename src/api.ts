import axios from 'axios';
import type {Direction, Doctor, Review, LoginRequest, AuthResponse, PageResponse} from './types';

const API_BASE_URL = 'http://localhost:8080/api';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 секунд таймаут
});

// Интерсептор для добавления токена к запросам
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Отправляем запрос:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('Ошибка в интерсепторе запроса:', error);
        return Promise.reject(error);
    }
);

// Интерсептор для обработки ответов и автоматического обновления токенов
apiClient.interceptors.response.use(
    (response) => {
        console.log('Получен ответ:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        console.error('Ошибка ответа:', error.response?.status, error.response?.data);

        const originalRequest = error.config;

        // Если получили 401 ошибку и это не запрос на логин/рефреш
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    console.log('Пытаемся обновить токен...');
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                        refreshToken: refreshToken
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // Повторяем оригинальный запрос с новым токеном
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    console.error('Ошибка обновления токена:', refreshError);
                    // Удаляем токены и перенаправляем на логин
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

// API для аутентификации
export const authAPI = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        try {
            console.log('Отправляем запрос на логин:', data.username);
            const response = await apiClient.post('/auth/login', data);
            console.log('Успешный ответ логина:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Ошибка API логина:', error);
            throw error;
        }
    },

    logout: (): Promise<void> =>
        apiClient.post('/auth/logout').then(res => res.data),

    refreshToken: (): Promise<AuthResponse> =>
        apiClient.post('/auth/refresh-token').then(res => res.data),
};

// API для направлений
export const directionsAPI = {
    getAll: (page = 0, size = 10): Promise<PageResponse<Direction>> =>
        apiClient.get('/directions', {params: {page, size}}).then(res => res.data),

    getById: (id: number): Promise<Direction> =>
        apiClient.get(`/directions/${id}`).then(res => res.data),

    create: (data: FormData): Promise<Direction> =>
        apiClient.post('/directions', data, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => res.data),

    update: (id: number, data: FormData): Promise<Direction> =>
        apiClient.put(`/directions/${id}`, data, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => res.data),

    delete: (id: number): Promise<void> =>
        apiClient.delete(`/directions/${id}`).then(res => res.data),
};

// API для врачей
export const doctorsAPI = {
    getAll: (page = 0, size = 10): Promise<PageResponse<Doctor>> =>
        apiClient.get('/doctors', {params: {page, size}}).then(res => res.data),

    getById: (id: number): Promise<Doctor> =>
        apiClient.get(`/doctors/${id}`).then(res => res.data),

    create: (data: FormData): Promise<Doctor> =>
        apiClient.post('/doctors', data, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => res.data),

    update: (id: number, data: FormData): Promise<Doctor> =>
        apiClient.put(`/doctors/${id}`, data, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => res.data),

    delete: (id: number): Promise<void> =>
        apiClient.delete(`/doctors/${id}`).then(res => res.data),
};

// API для отзывов
export const reviewsAPI = {
    getAll: (page = 0, size = 10): Promise<PageResponse<Review>> =>
        apiClient.get('/reviews', {params: {page, size}}).then(res => res.data),

    delete: (id: number): Promise<void> =>
        apiClient.delete(`/reviews/${id}`).then(res => res.data),
};

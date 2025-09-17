export const setAccessToken = (accessToken: string) => {
    localStorage.setItem("ACCESS_TOKEN", accessToken);
};

export const getAccessToken = () => localStorage.getItem("ACCESS_TOKEN");

export const clearAccessToken = () => {
    localStorage.removeItem("ACCESS_TOKEN");
};

export const isAuthenticated = (): boolean => {
    const token = getAccessToken();
    if (!token) return false;

    // Проверка истечения токена (опционально)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

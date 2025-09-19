export const setAccessToken = (accessToken: string) => {
    if (!accessToken) {
        console.warn('Attempted to set empty access token');
        return;
    }
    localStorage.setItem("ACCESS_TOKEN", accessToken);
};

export const getAccessToken = () => {
    try {
        return localStorage.getItem("ACCESS_TOKEN");
    } catch (error) {
        console.error('Failed to get access token from localStorage:', error);
        return null;
    }
};

export const clearAccessToken = () => {
    try {
        localStorage.removeItem("ACCESS_TOKEN");
    } catch (error) {
        console.error('Failed to clear access token from localStorage:', error);
    }
};

export const isAuthenticated = (): boolean => {
    const token = getAccessToken();
    if (!token) {
        console.log('No access token found');
        return false;
    }

    // Проверка истечения токена
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('Invalid JWT token format');
            clearAccessToken();
            return false;
        }

        const payload = JSON.parse(atob(parts[1]));
        const isExpired = payload.exp * 1000 <= Date.now();

        if (isExpired) {
            console.warn('Access token has expired');
            clearAccessToken();
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to parse JWT token:', error);
        clearAccessToken();
        return false;
    }
};

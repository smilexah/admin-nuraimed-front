import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {Login} from './components/Login';
import {Layout} from './components/Layout';
import {ProtectedRoute} from './components/ProtectedRoute';
import {DirectionsManager} from './components/DirectionsManager';
import {DoctorsManager} from './components/DoctorsManager';
import {ReviewsManager} from './components/ReviewsManager';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем наличие токена при загрузке
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        console.log('Проверка токенов при загрузке приложения:', {
            accessToken: token ? 'найден' : 'отсутствует',
            refreshToken: refreshToken ? 'найден' : 'отсутствует',
        });

        if (token) {
            console.log('Пользователь уже авторизован');
            setIsAuthenticated(true);
        } else {
            console.log('Пользователь не авторизован');
        }
        setLoading(false);
    }, []);

    const handleLogin = () => {
        console.log('Пользователь успешно авторизован');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        console.log('Пользователь вышел из системы');
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Загрузка...</div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Публичный маршрут для логина */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/directions" replace/>
                        ) : (
                            <Login onLogin={handleLogin}/>
                        )
                    }
                />

                {/* Защищенные маршруты */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Layout onLogout={handleLogout}/>
                        </ProtectedRoute>
                    }
                >
                    {/* Перенаправление с корня на направления */}
                    <Route index element={<Navigate to="/directions" replace/>}/>

                    {/* Защищенные страницы админки */}
                    <Route path="directions" element={<DirectionsManager/>}/>
                    <Route path="doctors" element={<DoctorsManager/>}/>
                    <Route path="reviews" element={<ReviewsManager/>}/>
                </Route>

                {/* Fallback маршрут */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/directions" : "/login"} replace/>}/>
            </Routes>
        </Router>
    );
}

export default App;

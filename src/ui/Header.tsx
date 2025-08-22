import {type FC} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import logoImage from '../assets/logo-nobuffer.png';
import {logout} from "../api/endpoints/auth.ts";
import {clearTokens, getAccessToken} from "../api/utils/tokenUtils.ts";

export const Header: FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const accessToken = getAccessToken();

        if (!accessToken) {
            console.error('Нет токена доступа для выхода');
            clearTokens();
            navigate('/login');
            return;
        }

        try {
            await logout(accessToken);
        } catch (error) {
            console.error('Ошибка выхода:', error);
        } finally {
            clearTokens();
            navigate('/login');
        }
    };

    return (
        <div className="text-white flex flex-col justify-between">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <img
                                src={logoImage}
                                alt="DI-CLINIC Logo"
                                className="h-10 w-25 object-contain"
                            />
                            <h1 className="text-3xl font-bold text-gray-900">
                                Админ панель DI-CLINIC
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            </header>

            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <NavLink
                            to="/directions"
                            className={({isActive}) =>
                                `py-4 px-1 border-b-2 font-medium text-sm ${
                                    isActive
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }
                        >
                            Направления
                        </NavLink>
                        <NavLink
                            to="/doctors"
                            className={({isActive}) =>
                                `py-4 px-1 border-b-2 font-medium text-sm ${
                                    isActive
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }
                        >
                            Врачи
                        </NavLink>
                        <NavLink
                            to="/reviews"
                            className={({isActive}) =>
                                `py-4 px-1 border-b-2 font-medium text-sm ${
                                    isActive
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }
                        >
                            Отзывы
                        </NavLink>
                    </div>
                </div>
            </nav>
        </div>
    )
}
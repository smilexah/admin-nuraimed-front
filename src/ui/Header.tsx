import {type FC, useState} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import logoImage from '../assets/logo-nobuffer.png';
import {logout} from "../api/endpoints/auth.ts";

export const Header: FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Ошибка выхода:', error);
            // В случае ошибки все равно перенаправляем на login
            navigate('/login');
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="text-white flex flex-col justify-between">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 md:py-6">
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <img
                                src={logoImage}
                                alt="DI-CLINIC Logo"
                                className="h-10 w-10 md:h-15 md:w-25 object-contain"
                            />
                            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 hidden sm:block">
                                Админ панель DI-CLINIC
                            </h1>
                            <h1 className="text-lg font-bold text-gray-900 sm:hidden">
                                Админ панель
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="hidden md:block bg-[#D1341F] text-white px-3 py-2 md:px-4 text-sm rounded-md hover:bg-[#D1341F]/90 transition-colors"
                            >
                                Выйти
                            </button>
                            <button
                                onClick={toggleMobileMenu}
                                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Desktop Navigation */}
            <nav className="bg-white shadow-sm border-b hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <NavLink
                            to="/directions"
                            className={({isActive}) =>
                                `py-4 px-1 border-b-2 font-medium text-sm ${
                                    isActive
                                        ? 'border-[#F59E2D] text-[#2A5963]'
                                        : 'border-transparent text-gray-500 hover:text-[#2A5963] hover:border-[#F59E2D]'
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
                                        ? 'border-[#F59E2D] text-[#2A5963]'
                                        : 'border-transparent text-gray-500 hover:text-[#2A5963] hover:border-[#F59E2D]'
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
                                        ? 'border-[#F59E2D] text-[#2A5963]'
                                        : 'border-transparent text-gray-500 hover:text-[#2A5963] hover:border-[#F59E2D]'
                                }`
                            }
                        >
                            Отзывы
                        </NavLink>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className={`bg-white shadow-sm border-b md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                <div className="px-4 py-2 space-y-1">
                    <NavLink
                        to="/directions"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({isActive}) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${
                                isActive
                                    ? 'bg-[#F59E2D]/10 text-[#2A5963] border-l-4 border-[#F59E2D]'
                                    : 'text-gray-500 hover:text-[#2A5963] hover:bg-[#F59E2D]/5'
                            }`
                        }
                    >
                        Направления
                    </NavLink>
                    <NavLink
                        to="/doctors"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({isActive}) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${
                                isActive
                                    ? 'bg-[#F59E2D]/10 text-[#2A5963] border-l-4 border-[#F59E2D]'
                                    : 'text-gray-500 hover:text-[#2A5963] hover:bg-[#F59E2D]/5'
                            }`
                        }
                    >
                        Врачи
                    </NavLink>
                    <NavLink
                        to="/reviews"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({isActive}) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${
                                isActive
                                    ? 'bg-[#F59E2D]/10 text-[#2A5963] border-l-4 border-[#F59E2D]'
                                    : 'text-gray-500 hover:text-[#2A5963] hover:bg-[#F59E2D]/5'
                            }`
                        }
                    >
                        Отзывы
                    </NavLink>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Logout Button */}
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Выйти
                    </button>
                </div>
            </nav>
        </div>
    )
}

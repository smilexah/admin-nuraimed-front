import type {FC} from "react";
import {LoginForm} from "../components/auth/LoginForm.tsx";
import {Container} from "../ui/Container.tsx";
import logo from "../assets/full-logo.png";

export const LoginPage:FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-4">
            <Container className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
                    <div className="flex flex-col text-center space-y-6 mb-8">
                        <div className="flex justify-center">
                            <img
                                src={logo}
                                alt="DI-CLINIC Logo"
                                className="h-24 md:h-32 w-auto object-contain"
                            />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Добро пожаловать
                            </h1>
                            <p className="text-gray-600 text-sm md:text-base">
                                Войдите в админ панель DI-CLINIC
                            </p>
                        </div>
                    </div>
                    <LoginForm />
                </div>
            </Container>
        </div>
    )
}
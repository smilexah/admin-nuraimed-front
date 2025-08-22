import type {FC} from "react";
import {LoginForm} from "../components/auth/LoginForm.tsx";
import {Container} from "../ui/Container.tsx";
import logo from "../assets/full-logo.png";

export const LoginPage:FC = () => {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <Container className={"flex flex-col w-fit gap-[20px]"} >
                <div className="flex flex-col text-center gap-4">
                    <img src={logo} alt="logo" className="h-[200px] w-50"/>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Добро пожаловать
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Войдите в админ панель DI-CLINIC
                    </p>
                </div>
                <LoginForm />
            </Container>
        </div>
    )
}
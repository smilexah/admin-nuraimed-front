import type {FC} from "react";
import {LoginForm} from "../components/auth/LoginForm.tsx";
import {Container} from "../ui/Container.tsx";
import logo from "../assets/logo.png";

export const LoginPage:FC = () => {
    return (
        <Container className={"flex flex-col w-fit gap-[20px]"} >
            <img src={logo} alt="logo"/>
            <LoginForm />
        </Container>
    )
}
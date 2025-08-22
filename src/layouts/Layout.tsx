import type {FC, ReactNode} from "react";
import {Header} from "../ui/Header.tsx";

interface LayoutProps {
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({children}) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header/>

            <main className="w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export {Layout};

import type {FC} from "react";
import {Layout} from "../layouts/Layout.tsx";

export const DoctorsPage: FC = () => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4">Doctors Page</h1>
                <p className="text-lg">This is the Doctors page content.</p>
            </div>
        </Layout>
    )
}
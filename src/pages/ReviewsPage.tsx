import type {FC} from "react";
import {Layout} from "../layouts/Layout.tsx";

export const ReviewsPage: FC = () => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Reviews Page</h1>
                <p className="text-lg">This is the reviews page content.</p>
            </div>
        </Layout>
    )
}
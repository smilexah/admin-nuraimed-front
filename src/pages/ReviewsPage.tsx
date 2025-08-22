import type {FC} from "react";
import {Layout} from "../layouts/Layout.tsx";
import {ReviewsManager} from "../components/reviews/ReviewsManager.tsx";

export const ReviewsPage: FC = () => {
    return (
        <Layout>
            <ReviewsManager />
        </Layout>
    )
}
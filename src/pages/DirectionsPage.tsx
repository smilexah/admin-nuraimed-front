import type {FC} from "react";
import {Layout} from "../layouts/Layout.tsx";
import {DirectionsManager} from "../components/directions/DirectionsManager.tsx";

export const DirectionsPage: FC = () => {
    return (
        <Layout>
            <div className="flex flex-col gap-4">
                <DirectionsManager />
            </div>
        </Layout>
    )
}
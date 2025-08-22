import type {FC} from "react";
import {Layout} from "../layouts/Layout.tsx";
import {DirectionsManager} from "../components/directions/DirectionsManager.tsx";

export const DirectionsPage: FC = () => {
    return (
        <Layout>
            <DirectionsManager/>
        </Layout>
    )
}
import type {FC} from "react";
import {Layout} from "../layouts/Layout.tsx";
import {DoctorsManager} from "../components/doctors/DoctorsManager.tsx";

export const DoctorsPage: FC = () => {
    return (
        <Layout>
            <DoctorsManager/>
        </Layout>
    )
}
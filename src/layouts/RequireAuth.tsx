import type {FC, ReactNode} from "react";
import {Navigate, Outlet} from "react-router-dom";
import {getAccessToken} from "../api/utils/tokenUtils.ts";

export const RequireAuth: FC<{ children?: ReactNode }> = ({children}) => {
    const accessToken = getAccessToken();

    if (!accessToken) return <Navigate to="/login" replace/>;

    return (
        <>
            {children}
            <Outlet />
        </>
    );
};
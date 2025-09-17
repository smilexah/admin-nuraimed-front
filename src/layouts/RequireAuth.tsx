import type {FC, ReactNode} from "react";
import {Navigate, Outlet} from "react-router-dom";
import {isAuthenticated} from "../api/utils/tokenUtils.ts";

export const RequireAuth: FC<{ children?: ReactNode }> = ({children}) => {
    if (!isAuthenticated()) return <Navigate to="/login" replace/>;

    return (
        <>
            {children}
            <Outlet />
        </>
    );
};
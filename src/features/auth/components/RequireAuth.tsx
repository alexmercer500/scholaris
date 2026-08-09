import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";

export default function RequireAuth({ children }: { children: ReactNode }) {
    const accessToken = useSelector((state: any) => state.auth?.accessToken);
    const location = useLocation();

    if (!accessToken) {
        return < Navigate to='/login' replace state={{ from: location.pathname }} />
    }
    return <>{children}</>
}
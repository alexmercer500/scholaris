import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "@app/hooks";

export default function RequireAuth({ children }: { children: ReactNode }) {
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const location = useLocation();

    if (!accessToken) {
        return < Navigate to='/login' replace state={{ from: location.pathname }} />
    }
    return <>{children}</>
}
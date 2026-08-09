import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

export default function GuestOnly({ children }: { children: ReactNode }) {
    const accessToken = useSelector((state: any) => state.auth?.accessToken);
    if (accessToken) {
        return <Navigate to='/' replace />
    }

    return <>{children}</>
}
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAppSelector } from "@app/hooks";

export default function GuestOnly({ children }: { children: ReactNode }) {
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    if (accessToken) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
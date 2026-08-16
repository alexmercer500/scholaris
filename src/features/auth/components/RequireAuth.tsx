import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router'
import type { RootState } from '@app/store'

export default function RequireAuth({ children }: { children: ReactNode }) {
    const accessToken = useSelector((state: RootState) => state.auth?.accessToken)
    const location = useLocation()

    if (!accessToken) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return <>{children}</>
}
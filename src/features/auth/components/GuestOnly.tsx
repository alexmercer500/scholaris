import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import type { RootState } from '@app/store'

export default function GuestOnly({ children }: { children: ReactNode }) {
    const accessToken = useSelector((state: RootState) => state.auth?.accessToken)

    if (accessToken) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
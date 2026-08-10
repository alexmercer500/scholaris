import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { loggedOut } from '@features/auth/authSlice'
import { toast } from 'sonner'

export function useLogout() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const logout = useCallback(() => {
        dispatch(loggedOut());
        navigate('/login', { replace: true })
        toast.success('Successfully Logged out')

    }, [dispatch, navigate])

    return logout
}
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { loggedOut } from '@features/auth/authSlice'
import { toast } from 'sonner'

export function useLogout() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const logout = useCallback(() => {
        try {
            dispatch(loggedOut());
            navigate('/')
            toast.success('Successfully Logged out')
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong')
        }
    }, [dispatch, navigate])

    return logout
}
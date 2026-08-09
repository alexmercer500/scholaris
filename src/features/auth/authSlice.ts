import { createSlice } from '@reduxjs/toolkit'
import type { User } from '@models/models'

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
}

const STORAGE_KEY = 'scholaris-auth';

function loadSession(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { accessToken: null, refreshToken: null, user: null }
  } catch {
    return { accessToken: null, refreshToken: null, user: null }
  }
}

const initialState: AuthState = loadSession();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsReceived(state, action) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    loggedOut(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { credentialsReceived, loggedOut } = authSlice.actions
export default authSlice.reducer

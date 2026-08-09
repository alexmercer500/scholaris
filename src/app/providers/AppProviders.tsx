import { Provider } from 'react-redux'
import { type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { store } from '@app/store'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  )
}

import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@app/store'

/** Typed replacements for the bare react-redux hooks. Use these everywhere. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

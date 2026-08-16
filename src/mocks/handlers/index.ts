import { http } from 'msw'
import { authHandlers } from './auth'
import { dashBoardHandlers } from './dashboard'
import { studentsHandlers } from './students'
import { attendanceHandlers } from './attendance'

export const handlers = [
  http.get('/api/health', () => {
    return Response.json({ status: 'ok' })
  }),
  ...authHandlers,
  ...dashBoardHandlers,
  ...studentsHandlers,
  ...attendanceHandlers,
]


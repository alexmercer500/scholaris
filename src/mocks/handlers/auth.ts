import { findUserByCredentials } from "@mocks/db/seed";
import { http, HttpResponse } from "msw";

interface LoginBody {
    email: string
    password: string
}

export const authHandlers = [
    http.post('/api/auth/login', async ({ request }) => {
        const body = (await request.json()) as LoginBody
        const user = findUserByCredentials(body.email, body.password)

        if (!user) {
            return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
        }
        const accessToken = btoa(JSON.stringify({ sub: user.id, role: user.role }))
        const refreshToken = btoa(JSON.stringify({ sub: user.id, type: 'refresh' }))

        return HttpResponse.json({
            accessToken,
            refreshToken,
            user,
            permissions: ['admin.read', 'admin.write']
        }, { status: 200 })
    })
]
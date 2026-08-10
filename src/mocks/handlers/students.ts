import { demoStudents, updateStudent } from "@mocks/db/students";
import { http, HttpResponse } from "msw";
import { demoClasses } from "@mocks/db/classes";

const classNames = Object.fromEntries(
    demoClasses.map((c) => [c.id, c.name])
)

export const studentsHandlers = [
    http.get('/api/students', () => {
        const updatedStudentLists = demoStudents.map((s) => ({
            ...s,
            className: classNames[s.classId] ?? s.classId
        }))
        return HttpResponse.json(updatedStudentLists);
    }),
    http.get('/api/students/:id', ({ params }) => {
        const student = demoStudents.find((s) => s.id === params.id);
        if (!student) return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
        return HttpResponse.json(student)
    }),
    http.put('/api/students/:id', async ({ params, request }) => {
        const body = await request.json()
        const updated = updateStudent(params.id as string, body)
        if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        return HttpResponse.json(updated)
    }),
]
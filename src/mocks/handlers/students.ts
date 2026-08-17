import { demoStudents, updateStudent, isRollNumberTaken } from "@mocks/db/students";
import { http, HttpResponse } from "msw";
import { demoClasses } from "@mocks/db/classes";
import type { Student } from "@models/models";

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
        const body = await request.json() as Partial<Student>
        const id = params.id as string

        if (body.rollNumber !== undefined) {
            const rollNumber = body.rollNumber.trim()
            if (!rollNumber) {
                return HttpResponse.json(
                    { message: 'Roll number is required', field: 'rollNumber' },
                    { status: 422 },
                )
            }
            if (isRollNumberTaken(rollNumber, id)) {
                return HttpResponse.json(
                    { message: `Roll number ${rollNumber} is already assigned to another student`, field: 'rollNumber' },
                    { status: 409 },
                )
            }
        }

        const updated = updateStudent(id, body)
        if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        return HttpResponse.json(updated)
    }),
]
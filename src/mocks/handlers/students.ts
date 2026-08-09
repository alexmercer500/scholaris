import { demoStudents } from "@mocks/db/students";
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
    })
]
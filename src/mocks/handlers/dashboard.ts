import { demoClasses } from "@mocks/db/classes";
import { demoStudents } from "@mocks/db/students";
import { demoTeachers } from "@mocks/db/teachers";
import { http, HttpResponse } from "msw";

export const dashBoardHandlers = [
    http.get('/api/dashboard', () => {
        return HttpResponse.json({
            students: demoStudents.length,
            teachers: demoTeachers.length,
            classes: demoClasses.length,
            attendance: 92
        })
    })
]
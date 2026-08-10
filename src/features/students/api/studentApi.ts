import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Student } from "@models/models";
import type { StudentRow } from "../column/column";

export const studentApi = createApi({
    reducerPath: 'studentApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Student'],
    endpoints: (builder) => ({
        getStudents: builder.query<StudentRow[], void>({
            query: () => '/students',
            providesTags: (result) => result
                ? result.map((s) => ({ type: 'Student' as const, id: s.id }))
                : [{ type: 'Student' as const, id: 'LIST' }],
        }),
        getStudent: builder.query<StudentRow, string>({
            query: (id) => `/students/${id}`,
            providesTags: (_result, _err, id) => [{ type: 'Student' as const, id }],
        }),
        updateStudent: builder.mutation<StudentRow, { id: string; updates: Partial<Student> }>({
            query: ({ id, updates }) => ({
                url: `/students/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: 'Student' as const, id: arg.id }],
        })
    })
})

export const { useGetStudentsQuery, useGetStudentQuery, useUpdateStudentMutation } = studentApi
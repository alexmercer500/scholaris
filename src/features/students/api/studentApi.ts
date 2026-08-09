import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Student } from "@models/models";

export const studentApi = createApi({
    reducerPath: 'studentApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getStudents: builder.query<Array<Student & { className: string }>, void>({
            query: () => '/students'
        })
    })
})

export const { useGetStudentsQuery } = studentApi
import { demoClasses } from './classes'

export const demoStudents = Array.from({ length: 100 }, (_, i) => {
  const classId = demoClasses[i % demoClasses.length].id

  return {
    id: `s${i + 1}`,
    rollNumber: `R${String(i + 1).padStart(3, '0')}`,
    name: `Student ${i + 1}`,
    classId,
    section: 'A',
    guardian: `Guardian ${i + 1}`,
    contact: `+91-90000000${String(i + 1).padStart(2, '0')}`,
    status: i % 10 === 0 ? 'inactive' : 'active',     // a few inactive
    enrolmentDate: `2024-06-${String((i % 28) + 1).padStart(2, '0')}`,
    attendancePercentage: 70 + (i % 30),
  }
})

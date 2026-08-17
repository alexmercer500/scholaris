import type { Student } from '@models/models'
import { demoClasses } from './classes'

/**
 * Persistent demo student database.
 *
 * Seed data is a static list of 100 realistic students. Edits (via PUT) are
 * written to localStorage so they survive a browser refresh. The seed is used
 * only on the very first load (or after localStorage is cleared).
 */

const STORAGE_KEY = 'scholaris-students'

/* ----- Unique, realistic names (Indian school context) ----- */
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Rohan', 'Ishaan',
  'Kabir', 'Ayaan', 'Reyansh', 'Krishna', 'Advik', 'Aryan', 'Ram', 'Shaurya',
  'Aaradhya', 'Ananya', 'Diya', 'Ira', 'Anika', 'Myra', 'Saanvi', 'Aadhya',
  'Navya', 'Priya', 'Riya', 'Sara', 'Anvi', 'Aisha', 'Kavya', 'Tanvi',
  'Aditi', 'Ishita', 'Meera', 'Nisha', 'Divya', 'Pooja', 'Shreya', 'Ritika',
  'Neha', 'Sneha', 'Kirti', 'Manish', 'Vikram', 'Rakesh', 'Sunil', 'Rahul',
  'Manoj', 'Deepak', 'Rajesh', 'Sanjay', 'Vijay', 'Nitin', 'Anil', 'Pankaj',
  'Suresh', 'Ganesh', 'Kunal', 'Amit', 'Ravi', 'Shashank', 'Nikhil', 'Om',
]

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Mehta', 'Patel', 'Singh', 'Kumar', 'Das',
  'Reddy', 'Nair', 'Menon', 'Iyer', 'Agarwal', 'Malhotra', 'Chopra', 'Rao',
  'Naidu', 'Kulkarni', 'Deshmukh', 'Joshi', 'Khan', 'Sheikh', 'Ansari',
  'Bhatt', 'Trivedi', 'Pandey', 'Mishra', 'Saxena', 'Chauhan', 'Yadav',
  'Thakur', 'Katoch', 'Bindra', 'Sodhi', 'Gill', 'Sandhu',
]

const GUARDIANS = [
  'Mr. Rajesh', 'Mrs. Sunita', 'Mr. Prakash', 'Mrs. Meena', 'Mr. Suresh',
  'Mrs. Anita', 'Mr. Ramesh', 'Mrs. Kavita', 'Mr. Dinesh', 'Mrs. Rekha',
  'Mr. Ashok', 'Mrs. Lata',
]

const CLASSES = demoClasses

/** Deterministic pseudo-random for stable seed data. */
function hashIndex(i: number, mod: number): number {
  // Simple stable pseudo-random in [0, mod)
  return Math.abs((i * 7 + 13 * 37) % mod)
}

/** Builds a 1-based padded identifier. */
function pad(n: number, length: number = 3): string {
  return String(n).padStart(length, '0')
}

/**
 * The 1,200 seed students for virtualization testing (scale to 1,200 × 31 columns ≈ 37k cells).
 * Distributed: 200 students per class across 6 classes.
 * `id` matches the list index (s1..s1200) so the roll number and id stay consistent across the app.
 */
function buildSeed(): Student[] {
  return Array.from({ length: 1200 }, (_, i) => {
    const firstName = FIRST_NAMES[hashIndex(i, FIRST_NAMES.length)]
    const lastName = LAST_NAMES[hashIndex(i + 17, LAST_NAMES.length)]
    const name = `${firstName} ${lastName}`
    const classId = CLASSES[i % CLASSES.length].id

    return {
      id: `s${i + 1}`,
      rollNumber: `R${pad(i + 1, 4)}`,
      name,
      classId,
      section: 'A',
      guardian: GUARDIANS[hashIndex(i + 5, GUARDIANS.length)],
      contact: `+91-${pad(9000 + (i % 10000), 5)}`,
      status: i % 10 === 0 ? 'inactive' : i % 7 === 0 ? 'transferred' : 'active',
      enrolmentDate: `2024-06-${pad((i % 28) + 1, 2)}`,
      attendancePercentage: 70 + (i % 30),
    }
  })
}

/* ----- Persistence helpers ----- */
function loadSeed(): Student[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as Student[]
  } catch {
    /* ignore corrupt storage */
  }
  return buildSeed()
}

export const demoStudents = loadSeed()

export function resetStudents(): void {
  localStorage.removeItem(STORAGE_KEY)
  const fresh = buildSeed()
  demoStudents.splice(0, demoStudents.length, ...fresh)
}

export function isRollNumberTaken(rollNumber: string, exceptId: string): boolean {
  const normalised = rollNumber.trim().toLowerCase()
  return demoStudents.some(
    (s) => s.id !== exceptId && s.rollNumber.trim().toLowerCase() === normalised,
  )
}

export function updateStudent(id: string, updates: Partial<Student>): Student | undefined {
  const idx = demoStudents.findIndex((s) => s.id === id)
  if (idx === -1) return undefined
  demoStudents[idx] = { ...demoStudents[idx], ...updates }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStudents))
  } catch {
    /* storage may be full/disabled — edit still applies in-memory */
  }
  return demoStudents[idx]
}


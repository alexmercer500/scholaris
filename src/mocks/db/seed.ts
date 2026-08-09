/** Demo users — the auth seed. Students/teachers live in their own files. */

interface User {
  id: string
  name: string
  email: string
  password: string
  role: string
}

export const demoUsers: User[] = [
  {
    id: 'b05492e3-e95c-4855-aa56-33dc4d9bd25c',
    name: 'Aria Sharma',
    email: 'admin@scholaris.edu',
    password: 'admin@123',
    role: 'ADMIN',
  },
]

/** Look up a user by credentials; returns the user without its password. */
export function findUserByCredentials(
  email: string,
  password: string,
): Omit<User, 'password'> | null {
  const user = demoUsers.find((u) => u.email === email && u.password === password)
  if (!user) return null
  const { password: _pw, ...safeUser } = user
  return safeUser
}

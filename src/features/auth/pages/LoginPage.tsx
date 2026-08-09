import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useLoginMutation } from '../api/authApi'
import { useDispatch } from 'react-redux'
import { credentialsReceived } from '../authSlice'
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Presentation,
  BookOpen,
} from 'lucide-react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import AuthWrapper from '../components/AuthWrapper'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'

type FormState = {
  email: string;
  password: string
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // TODO: wire form submission to your future auth mutation.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const result = await login(form).unwrap()
      dispatch(credentialsReceived(
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        }
      ))
      toast.success('Login Successfull')
      navigate('/')
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message
      toast.error(message ?? 'Login failed. Try again.')
    }
  }

  // TODO: make these pre-fill the email/password inputs.
  function quickFill() { }

  return (
    <AuthWrapper>
      <main className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen p-6 sm:p-12 relative">
        <div className="md:hidden flex flex-col items-center mb-10 w-full">
          <GraduationCap className="w-10 h-10 text-primary mb-2" />
          <h1 className="font-headline text-3xl font-bold text-primary tracking-tight">
            SCHOLARIS
          </h1>
        </div>

        <div className="w-full max-w-md bg-surface rounded-[12px] p-8 sm:p-10 shadow-soft border border-outline-variant/30 relative z-10">
          <div className="mb-8 text-center">
            <h2 className="font-headline text-3xl text-on-surface mb-3 font-medium">
              Welcome back
            </h2>
            <p className="text-on-surface-variant font-body text-base leading-relaxed">
              Please enter your details to sign in to your workspace.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email field */}
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="name@example.com"
              icon={<Mail className="w-5 h-5" />}
              autoComplete="email"
              name='email'
              value={form.email}
              onChange={handleChange}
            />

            {/* Password field */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                autoComplete="current-password"
                name='password'
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 pt-7 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Utilities row */}
            {/* <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary bg-surface-container-lowest border-outline-variant rounded focus:ring-primary focus:ring-2 transition-colors cursor-pointer"
                />
                <span className="ml-2 block text-sm text-on-surface-variant font-body">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-primary hover:text-primary-fixed-dim transition-colors"
              >
                Forgot password?
              </a>
            </div> */}

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full">
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          {/* Demo quick-fill */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-outline-variant/50" />
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Demo accounts
              </span>
              <div className="h-px flex-1 bg-outline-variant/50" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-col gap-1 py-3"
                onClick={() => quickFill()}
              >
                <User className="w-4 h-4" />
                Admin
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-col gap-1 py-3"
                onClick={() => quickFill()}
              >
                <Presentation className="w-4 h-4" />
                Teacher
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-col gap-1 py-3"
                onClick={() => quickFill()}
              >
                <BookOpen className="w-4 h-4" />
                Student
              </Button>
            </div>
          </div>
        </div>
      </main>
    </AuthWrapper>
  )
}

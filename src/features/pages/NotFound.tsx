import { Link } from 'react-router'
import { Compass, Home, GraduationCap } from 'lucide-react'

export function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface font-body px-6 py-12 relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary-container/20 blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-tertiary-container/20 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                {/* Brand mark */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-on-primary" />
                    </div>
                    <span className="font-headline text-xl font-bold text-primary">
                        Scholaris
                    </span>
                </div>

                {/* 404 */}
                <h1 className="font-headline text-8xl sm:text-9xl font-bold text-primary leading-none tracking-tight">
                    404
                </h1>

                {/* Icon */}
                <div className="mt-6 mb-5 w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                    <Compass className="w-8 h-8 text-primary" />
                </div>

                {/* Message */}
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">
                    You seem lost
                </h2>
                <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-md">
                    The page you're looking for doesn't exist or may have been moved.
                    Let's get you back on track.
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-primary text-on-primary font-semibold hover:bg-primary-fixed-dim transition-colors active:scale-[0.98] duration-200"
                    >
                        <Home className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-surface-bright text-primary border border-outline-variant hover:bg-surface-container-low transition-colors active:scale-[0.98] duration-200 font-semibold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    )
}
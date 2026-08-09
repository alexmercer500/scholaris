import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

interface AuthWrapperProps {
    children: ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-on-surface font-body">
            <aside className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay bg-linear-to-br from-primary-container to-primary-fixed-dim" />

                <div className="relative z-10 flex flex-col items-center text-center px-12">
                    <div className="w-24 h-24 rounded-full bg-surface/10 flex items-center justify-center mb-8 backdrop-blur-sm border border-surface/20">
                        <GraduationCap className="w-12 h-12 text-on-primary" />
                    </div>
                    <h1 className="font-headline text-5xl lg:text-6xl font-bold text-on-primary tracking-tight mb-4">
                        SCHOLARIS
                    </h1>
                    <p className="text-primary-fixed-dim font-body text-xl font-light tracking-wide max-w-sm leading-relaxed">
                        Management System
                    </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-black/20 to-transparent" />
            </aside>
            {children}
        </div>
    )
}
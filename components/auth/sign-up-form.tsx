'use client'

import { useAuthContext } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import StepRole from './sign-up/StepRole'
import StepCredentials from './sign-up/StepCredentials'
import StepVerify from './sign-up/StepVerify'
import { useRouter } from 'next/navigation'
import { usePropertySignUp } from '@/lib/hooks/use-sign-up'
import { useEffect } from 'react'

export default function SignUpForm() {
    const router = useRouter();
    const signUpHook = usePropertySignUp()
    const { onboarding, setCurrentStep } = useAuthContext()
    const step = onboarding.currentStep || 1

    const { resetOnboarding } = useAuthContext()
    const { resetSignUp } = usePropertySignUp()

    useEffect(() => {
        resetOnboarding()
        resetSignUp()
    }, [resetOnboarding, resetSignUp])

    const getHeader = () => {
        if (step === 1) {
            return {
                title: 'Create an account',
                subtitle:
                    "Tell us about yourself. Let's tailor your experience.",
            }
        }
        if (step === 2) {
            return {
                title: 'Account details',
                subtitle: 'Enter your email and password',
            }
        }
        return {
            title: 'Verify your email',
            subtitle: 'Enter the code sent to your email',
        }
    }

    const { title, subtitle } = getHeader()

    return (
        <>
            <div className="flex items-center justify-between">
                {step > 1 ? (
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentStep(step - 1)}
                        className="p-1 h-auto rounded-full "
                    >
                        <ChevronLeft className="w-4 h-4 mr-1 hover:none" />
                        Back
                    </Button>
                ) : <div />}
            </div>

            <div className="space-y-1 text-center">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {step === 1 && <StepRole />}
            {step === 2 && <StepCredentials {...signUpHook} />}
            {step === 3 && <StepVerify {...signUpHook} />}

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <span onClick={() => router.push('/auth/sign-in')} className="text-primary font-medium cursor-pointer">
                    Sign in
                </span>
            </p>

            <div className="flex gap-2 pt-2">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-border'
                            }`}
                    />
                ))}
            </div>

        </>
    )
}
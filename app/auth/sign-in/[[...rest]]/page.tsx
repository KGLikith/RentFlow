import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  return (
    <>
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 bg-white dark:bg-background">
        <div className="w-full max-w-md space-y-6">

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your properties</p>
          </div>

          <SignInForm />
        </div>
      </div>
    </>
  )
}
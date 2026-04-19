import { ForgotPasswordForm } from "@/components/auth/forget-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 sm:p-12 bg-white dark:bg-background">
      <div className="w-full max-w-md">

        <ForgotPasswordForm />

      </div>
    </div>
  )
}
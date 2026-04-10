import { AuthLayout } from '@/components/auth/auth-layout'
import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to manage your properties and tenants"
    >
      <SignInForm />
    </AuthLayout>
  )
}

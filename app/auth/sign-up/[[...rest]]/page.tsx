import SignUpForm from '@/components/auth/sign-up-form'

export default function page() {
  return (
    <>
      <div className="flex flex-1 items-center justify-center p-6 pt-4 sm:p-12 sm:pt-8 bg-white dark:bg-background">
        <div className="w-full max-w-md space-y-4">
          <SignUpForm />
        </div>
      </div>
    </>
  )
}
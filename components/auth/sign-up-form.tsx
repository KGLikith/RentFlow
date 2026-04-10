'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePropertySignUp } from '@/lib/hooks/use-sign-up'
import { useAuthContext } from '@/lib/context/auth-context'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function SignUpForm() {
    const { initializeSignUp, verifyOTP, loading, error, pendingCreation } =
        usePropertySignUp()
    const { onboarding, updateOwnerData } = useAuthContext()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otp, setOTP] = useState('')
    const [upiId, setUpiId] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const handleInitialize = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError('')

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters')
            return
        }

        const success = await initializeSignUp(
            email,
            password,
            onboarding.ownerName || 'User',
        )

        if (success) {
            setEmail('')
            setPassword('')
            setConfirmPassword('')
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()

        const success = await verifyOTP(
            otp,
            onboarding.ownerName || 'User',
            onboarding.userRole === 'OWNER' ? upiId : undefined,
        )

        if (success) {
            setOTP('')
        }
    }

    if (pendingCreation) {
        return (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Verify Your Email
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter the 6-digit code sent to {email}
                    </p>
                </div>

                <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                    className="h-11 tracking-widest text-center text-lg"
                    required
                />

                {onboarding.userRole === 'OWNER' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                            UPI ID <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="yourname@bankname"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            disabled={loading}
                            className="h-11"
                            required
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Required for rent collection
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-lg disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        'Verify & Create Account'
                    )}
                </Button>
            </form>
        )
    }

    return (
        <form onSubmit={handleInitialize} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Address
                </label>
                <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Password
                </label>
                <Input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordError('')
                    }}
                    disabled={loading}
                    className="h-11"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Confirm Password
                </label>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setPasswordError('')
                    }}
                    disabled={loading}
                    className="h-11"
                    required
                />
            </div>

            {(error || passwordError) && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error || passwordError}
                    </p>
                </div>
            )}

            <Button
                type="submit"
                disabled={loading || !email || !password || !confirmPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-lg disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    'Continue'
                )}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                    Already have an account?{' '}
                    <Link
                        href="/auth/sign-in"
                        className="text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </form>
    )
}

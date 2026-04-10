'use client'

// changed -> user-role | null

import React, { createContext, useContext, useState, useCallback } from 'react'

export type UserRole = 'OWNER' | 'TENANT'

export interface OnboardingState {
  currentStep: number
  userRole: UserRole | null
  ownerName?: string
  ownerPhone?: string
  ownerUPI?: string
  ownerEmail?: string
  businessName?: string
  address?: string
}

interface AuthContextType {
  onboarding: OnboardingState
  setCurrentStep: (step: number) => void
  setUserRole: (role: UserRole | null) => void
  updateOwnerData: (data: Partial<OnboardingState>) => void
  resetOnboarding: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: OnboardingState = {
  currentStep: 0,
  userRole: null,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [onboarding, setOnboarding] = useState<OnboardingState>(initialState)

  const setCurrentStep = useCallback((step: number) => {
    setOnboarding(prev => ({ ...prev, currentStep: step }))
  }, [])

  const setUserRole = useCallback((role: UserRole | null) => {
    setOnboarding(prev => ({ ...prev, userRole: role }))
  }, [])

  const updateOwnerData = useCallback((data: Partial<OnboardingState>) => {
    setOnboarding(prev => ({ ...prev, ...data }))
  }, [])

  const resetOnboarding = useCallback(() => {
    setOnboarding(initialState)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        onboarding,
        setCurrentStep,
        setUserRole,
        updateOwnerData,
        resetOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

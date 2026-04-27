import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface UserProfile {
  id: string
  name?: string
  email: string
  phone?: string
  upiId?: string
  role: string
}

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch('/api/user/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update profile')
  }
  return res.json()
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile'], data)
    },
  })
}

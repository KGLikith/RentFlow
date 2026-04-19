import Landing from '@/components/landing/Landing'
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()

  return <Landing userId={userId} />
}
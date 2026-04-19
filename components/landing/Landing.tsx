import Navbar from './Navbar'
import Hero from './Hero'
import Stats from './Stats'
import Features from './Features'
import Footer from './Footer'
import TenantManagement from './TenantManagement'
import HowItWorks from './HowItWorks'
import Testimonial from './Testimonial'
import CTA from './CTA'

export default async function Landing({ userId }: { userId: string | null }) {

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar userId={userId} />
      <Hero />
      <Stats />
      <Features />
      <TenantManagement />
      <HowItWorks />
      <Testimonial />
      <CTA />
      <Footer />
    </div>
  )
}
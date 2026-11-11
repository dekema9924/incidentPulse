


import LandingNav from '@/components/layout/landing/LandingNav'
import Hero from '@/components/layout/landing/Hero'
import Features from '@/components/layout/landing/Features'
import Workflow from '@/components/layout/landing/Workflow'
import UnderTheHood from '@/components/layout/landing/UnderTheHood'
import Pricing from '@/components/layout/landing/Pricing'
import FinalCta from '@/components/layout/landing/FinalCta'
import Footer from '@/components/layout/landing/Footer'


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0E1015] text-[#E7E9EE] antialiased scroll-sm">
      <LandingNav />

      <main>
        <Hero />
        <Features />
        <Workflow />
        <UnderTheHood />
        <Pricing />
        <FinalCta />
      </main>

      <Footer />
    </div>
  )
}
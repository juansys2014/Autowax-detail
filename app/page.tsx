import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Marquee } from "@/components/marquee"
import { Services } from "@/components/services"
import { WhyUs } from "@/components/why-us"
import { CTASection } from "@/components/cta-section"
import { Testimonials } from "@/components/testimonials"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Marquee />
      <Services />
      <WhyUs />
      <CTASection />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}

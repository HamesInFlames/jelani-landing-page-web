import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Problem } from './components/Problem'
import { Services } from './components/Services'
import { WhyMe } from './components/WhyMe'
import { About } from './components/About'
import { Pricing } from './components/Pricing'
import { Process } from './components/Process'
import { Proof } from './components/Proof'
import { Work } from './components/Work'
import { CtaSection } from './components/CtaSection'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      {/* Gold page-progress hairline — pure CSS scroll-driven animation;
          browsers without support (or with reduced motion) never see it. */}
      <div className="scroll-progress" aria-hidden="true" />

      <Nav />

      <main>
        <Hero />
        <Marquee />
        <Problem />
        <Work />
        <Services />
        <WhyMe />
        <About />
        <Process />
        <Proof />
        <Pricing />
        <CtaSection />
      </main>

      <Footer />
    </>
  )
}

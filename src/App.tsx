import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Services } from './components/Services'
import { About } from './components/About'
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

      <Nav />

      <main>
        <Hero />
        <Marquee />
        <Work />
        <Services />
        <About />
        <Proof />
        <CtaSection />
      </main>

      <Footer />
    </>
  )
}

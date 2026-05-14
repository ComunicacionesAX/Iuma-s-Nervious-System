import Nav from '../shared/Nav'
import Hero from './Hero'
import Pillars from './Pillars'
import DigitalNervousSystem from './DigitalNervousSystem'
import Leverage from './Leverage'
import ChainDiagram from './ChainDiagram'
import Footer from './Footer'

export default function LandingScreen({ onGoLive }) {
  return (
    <div className="relative landing-scroll" style={{ background: '#ffffff' }}>
      <Nav onGoLive={onGoLive} />
      <main>
        <Hero onGoLive={onGoLive} />
        <Pillars />
        <DigitalNervousSystem />
        <Leverage />
        <ChainDiagram />
        <Footer onGoLive={onGoLive} />
      </main>
    </div>
  )
}

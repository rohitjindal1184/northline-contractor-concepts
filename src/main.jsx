import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics, track } from '@vercel/analytics/react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Ruler,
  X,
} from 'lucide-react'
import './styles.css'

const concepts = [
  {
    slug: 'project-stories',
    number: '03',
    name: 'Vertical Project Stories',
    description: 'Project-first, cinematic, and designed for immediate visual impact.',
    preview: '/images/concept-stories.webp',
    featured: true,
  },
  {
    slug: 'daily-build-log',
    number: '01',
    name: 'The Daily Build Log',
    description: 'A transparent process told through field notes, phases, and proof of craft.',
    preview: '/images/concept-daily.webp',
  },
  {
    slug: 'field-book',
    number: '02',
    name: "The Architect's Field Book",
    description: 'Measured, tactile, and editorial—premium without feeling precious.',
    preview: '/images/concept-fieldbook.webp',
  },
  {
    slug: 'category-standard',
    number: '04',
    name: 'The Category Standard',
    description: 'The familiar contractor structure, executed with care and clarity.',
    preview: '/images/concept-standard.webp',
  },
]

function useRoute() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = (next) => {
    window.history.pushState({}, '', next)
    setPath(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return [path, navigate]
}

function DemoForm({ compact = false, theme = 'dark' }) {
  const [status, setStatus] = useState('idle')
  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus('sending')
    window.setTimeout(() => setStatus('sent'), 700)
  }
  return (
    <form className={`estimate-form estimate-form--${theme} ${compact ? 'estimate-form--compact' : ''}`} onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>Name</span>
          <input name="name" placeholder="Your name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="you@example.com" required />
        </label>
        <label className="form-wide">
          <span>What are you planning?</span>
          <select name="project" defaultValue="">
            <option value="" disabled>Select a project type</option>
            <option>Renovation</option>
            <option>Addition</option>
            <option>New build</option>
            <option>Not sure yet</option>
          </select>
        </label>
      </div>
      <button className="submit-button" type="submit" disabled={status !== 'idle'} aria-live="polite">
        {status === 'idle' && <>Request an estimate <ArrowRight size={18} /></>}
        {status === 'sending' && 'Preparing your request…'}
        {status === 'sent' && <><Check size={18} /> Demo request captured</>}
      </button>
      <p className="form-note">Demo only—connect this form to your CRM or inbox.</p>
    </form>
  )
}

function BackBar({ navigate, tone = 'light' }) {
  return (
    <button className={`back-bar back-bar--${tone}`} onClick={() => navigate('/')}>
      <ArrowLeft size={16} /> Back to concepts
    </button>
  )
}

function BookingBanner({ theme, onOpen }) {
  return (
    <aside className={`booking-banner booking-banner--${theme}`} aria-label="Website consultation">
      <div className="booking-banner__inner">
        <p><b>Like this direction?</b> <span>Let’s create a website for your business.</span></p>
        <button className="booking-banner__button" type="button" onClick={onOpen}>
          Schedule a meeting <CalendarDays size={18} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

function BookingModal({ open, onClose, theme }) {
  const [scriptStatus, setScriptStatus] = useState('loading')
  const dialogRef = useRef(null)

  useEffect(() => {
    const scriptId = 'tidycal-booking-script'
    let script = document.getElementById(scriptId)
    const handleLoad = () => setScriptStatus('ready')
    const handleError = () => setScriptStatus('error')

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js'
      script.async = true
      script.addEventListener('load', handleLoad)
      script.addEventListener('error', handleError)
      document.body.appendChild(script)
    } else {
      setScriptStatus('ready')
    }

    return () => {
      script?.removeEventListener('load', handleLoad)
      script?.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      dialog?.querySelector('.booking-modal__close')?.focus()
    }, 40)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...dialog.querySelectorAll('button, a[href], iframe, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open, onClose])

  return (
    <div
      className={`booking-modal booking-modal--${theme} ${open ? 'booking-modal--open' : ''}`}
      aria-hidden={!open}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="booking-modal__panel" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title" ref={dialogRef}>
        <header className="booking-modal__header">
          <button className="booking-modal__close" type="button" onClick={onClose} aria-label="Close booking calendar">
            <X size={20} aria-hidden="true" />
          </button>
          <h2 id="booking-modal-title">Let’s create your website.</h2>
          <p>Choose a 15-minute time to talk through your business, the direction you like, and what it would take to launch it.</p>
          <div className="booking-modal__steps" aria-label="What happens next">
            <span>Pick a time</span>
            <span>Share your goals</span>
            <span>Leave with a clear next step</span>
          </div>
        </header>
        <div className="booking-modal__calendar">
          <div className="tidycal-embed" data-path="rohitjindal1184/create-your-website"></div>
          <p className="booking-modal__fallback" aria-live="polite">
            {scriptStatus === 'error' ? 'The embedded calendar could not load. ' : ''}
            <a href="https://tidycal.com/rohitjindal1184/create-your-website" target="_blank" rel="noreferrer">Open the booking page in a new tab</a>
          </p>
        </div>
      </section>
    </div>
  )
}

function BrandMark() {
  return (
    <a className="brand-mark" href="#top" aria-label="Northline Build Co. home">
      <span className="brand-mark__symbol"><Ruler size={19} /></span>
      <span>Northline <b>Build Co.</b></span>
    </a>
  )
}

function Gallery({ navigate }) {
  return (
    <main className="gallery-page">
      <header className="gallery-nav">
        <BrandMark />
        <p>Four directions. One fictional contractor.</p>
      </header>

      <section className="gallery-intro">
        <div className="gallery-intro__spacer" aria-hidden="true"></div>
        <h1>Which website feels like <em>your</em> business?</h1>
        <div className="gallery-intro__aside">
          <p>Explore four complete landing-page directions built for the same general contractor.</p>
          <span>Choose a concept to open it <ChevronDown size={16} /></span>
        </div>
      </section>

      <section className="concept-grid" aria-label="Website concepts">
        {concepts.map((concept) => (
          <article className={`concept-card ${concept.featured ? 'concept-card--featured' : ''}`} key={concept.slug}>
            <button className="concept-card__hit" onClick={() => navigate(`/${concept.slug}`)} aria-label={`Open ${concept.name}`}></button>
            <div className="concept-card__media">
              <img src={concept.preview} alt={`${concept.name} website preview`} />
              {concept.featured && <span className="concept-card__flag">Your pick</span>}
            </div>
            <div className="concept-card__copy">
              <span className="concept-card__number">{concept.number}</span>
              <div>
                <h2>{concept.name}</h2>
                <p>{concept.description}</p>
              </div>
              <span className="concept-card__arrow"><ArrowRight size={22} /></span>
            </div>
          </article>
        ))}
      </section>

      <footer className="gallery-footer">
        <p>Northline Build Co. is a fictional demonstration brand.</p>
        <p>Built to show what a contractor website could become.</p>
      </footer>
    </main>
  )
}

function DailyBuildLog({ navigate }) {
  const services = [
    ['Renovations', 'Rework the space you already love with a clearer layout and finishes made to last.'],
    ['Additions', 'Add the room you need without losing what makes the existing home feel right.'],
    ['New builds', 'Take a ground-up home from first sketch through a confident final walkthrough.'],
  ]
  return (
    <main className="daily-page" id="top">
      <BackBar navigate={navigate} tone="dark" />
      <nav className="daily-nav">
        <BrandMark />
        <div className="daily-nav__links"><a href="#services">Services</a><a href="#process">Process</a><a href="#estimate">Estimate</a></div>
      </nav>

      <section className="daily-hero">
        <img src="/images/project-kitchen.webp" alt="Warm completed kitchen renovation" />
        <div className="daily-hero__shade"></div>
        <div className="daily-hero__copy">
          <h1>Built with a plan.<br />Finished with pride.</h1>
          <p>Renovations · Additions · New builds</p>
          <a className="daily-cta" href="#estimate">Request an estimate <ArrowRight size={19} /></a>
        </div>
      </section>

      <ol className="phase-rail" id="process">
        <li><span>01</span><b>Discover</b><small>Listen first</small></li>
        <li><span>02</span><b>Plan</b><small>Scope clearly</small></li>
        <li><span>03</span><b>Build</b><small>Communicate daily</small></li>
        <li><span>04</span><b>Handover</b><small>Finish completely</small></li>
      </ol>

      <section className="daily-services" id="services">
        <div className="daily-services__heading">
          <h2>Good work starts before the first tool comes out.</h2>
          <p>Every Northline project follows a visible plan. You know what’s next, who’s responsible, and where decisions stand.</p>
        </div>
        <div className="daily-services__list">
          {services.map(([title, copy], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
              <ArrowRight size={20} />
            </article>
          ))}
        </div>
      </section>

      <section className="daily-project">
        <div className="daily-project__image"><img src="/images/project-addition.webp" alt="Light-filled completed home addition" /></div>
        <div className="daily-project__note">
          <span>Field note</span>
          <h2>Make the new work feel like it was always meant to be there.</h2>
          <p>Additions demand more than extra square footage. The roofline, light, materials, and everyday circulation all have to belong to the same home.</p>
          <div className="inspection-stamp">Checked<br />on site</div>
        </div>
      </section>

      <section className="daily-estimate" id="estimate">
        <div><h2>Tell us what you’re thinking about building.</h2><p>A short conversation is enough to see whether the project and team are a fit.</p></div>
        <DemoForm />
      </section>
    </main>
  )
}

function PlanIcon({ type }) {
  if (type === 'renovation') return <svg viewBox="0 0 120 90" aria-hidden="true"><path d="M10 78V18h64v60M10 45h64M42 18v60M74 32h34v46H74M88 32v46M10 78h98"/><path d="M28 30h8M28 57h8M89 47h8"/></svg>
  if (type === 'addition') return <svg viewBox="0 0 120 90" aria-hidden="true"><path d="M8 78h104M17 78V36l28-21 28 21v42M73 78V45l18-13 21 15v31M45 15v63M30 78V53h28v25"/><path d="M80 57h19M90 47v21"/></svg>
  return <svg viewBox="0 0 120 90" aria-hidden="true"><path d="M7 78h106M16 78V39L60 10l44 29v39M31 78V50h22v28M68 50h21v18H68z"/><path d="M10 42 60 8l50 34M60 10v68"/></svg>
}

function FieldBook({ navigate }) {
  return (
    <main className="field-page" id="top">
      <BackBar navigate={navigate} tone="paper" />
      <nav className="field-nav">
        <BrandMark />
        <div className="field-nav__links"><a href="#work">Services</a><a href="#method">Our method</a><a href="#contact">Contact</a></div>
        <a href="#contact" className="field-nav__cta">Request an estimate</a>
      </nav>

      <section className="field-hero">
        <div className="field-hero__copy">
          <h1>Build it once.<br />Build it right.</h1>
          <p>Renovations, additions, and new homes—planned carefully and built to last.</p>
          <a href="#contact">Request an estimate <ArrowRight size={18} /></a>
        </div>
        <div className="field-hero__measure field-hero__measure--vertical">24′—0″</div>
        <figure className="field-hero__image">
          <img src="/images/project-exterior.webp" alt="Completed modern craftsman home exterior" />
          <figcaption>Natural materials.<br />Built to last.</figcaption>
        </figure>
        <div className="field-hero__projects">
          <p><b>A</b> Whole-home renovation</p>
          <p><b>B</b> Seamless addition</p>
        </div>
      </section>

      <section className="plan-services" id="work">
        <h2>Designed around how you live.</h2>
        <div className="plan-services__grid">
          {[['renovation','Renovations','Better flow, better light, and details that make the whole house feel resolved.'],['addition','Additions','New space that connects naturally to what is already there.'],['build','New builds','A clear path from first ideas to the final set of keys.']].map(([type,title,copy]) => (
            <article key={title}><PlanIcon type={type} /><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="field-method" id="method">
        <figure><img src="/images/project-addition.webp" alt="Living room addition opening to a garden" /><figcaption>One team, from first conversation through final walkthrough.</figcaption></figure>
        <div>
          <h2>The drawing is only the beginning.</h2>
          <p>Good building is equal parts planning, coordination, and care on site. We keep the process legible so decisions arrive before they become delays.</p>
          <ol><li><span>Understand</span>the home and the goal</li><li><span>Define</span>scope, sequence, and selections</li><li><span>Build</span>with a clean site and clear updates</li></ol>
        </div>
      </section>

      <section className="field-contact" id="contact">
        <div><h2>Let’s put your project on paper.</h2><p>Share the broad strokes. This demo form can connect to email, a calendar, or your CRM.</p></div>
        <DemoForm theme="paper" />
      </section>
    </main>
  )
}

const storySlides = [
  { image: '/images/project-kitchen.webp', title: 'Kitchens made for real life.', type: 'Renovation', copy: 'More room to gather. Better light. Materials that get richer with use.' },
  { image: '/images/project-addition.webp', title: 'Space that feels inevitable.', type: 'Addition', copy: 'A new room that connects cleanly to the rhythm of the original home.' },
  { image: '/images/project-exterior.webp', title: 'A home from the ground up.', type: 'New build', copy: 'One accountable team from the first plan to the final walkthrough.' },
]

function ProjectStories({ navigate }) {
  const [active, setActive] = useState(0)
  return (
    <main className="stories-page" id="top">
      <BackBar navigate={navigate} tone="overlay" />
      <nav className="stories-nav"><BrandMark /><a href="#estimate">Request an estimate</a></nav>
      <div className="stories-rail" aria-label="Choose project story">
        {storySlides.map((slide, index) => <button key={slide.type} className={active === index ? 'active' : ''} aria-pressed={active === index} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{slide.type}</button>)}
      </div>
      <section className="story-stage">
        {storySlides.map((slide, index) => (
          <article className={`story-slide ${active === index ? 'active' : ''}`} key={slide.type} aria-hidden={active !== index}>
            <img src={slide.image} alt={`${slide.type} project`} />
            <div className="story-slide__scrim"></div>
            <div className="story-slide__copy">
              <span>{slide.type}</span>
              <h1>{slide.title}</h1>
              <p>{slide.copy}</p>
              {active === index && <a href="#estimate">Start your project <ArrowRight size={19} /></a>}
            </div>
          </article>
        ))}
        <div className="story-count"><b>{String(active + 1).padStart(2, '0')}</b><span>/ 03</span></div>
      </section>
      <section className="stories-summary">
        <h2>See the work.<br />Understand the process.</h2>
        <p>Northline brings planning and construction under one roof, so homeowners always know what happens next.</p>
        <div><span>Plan carefully</span><span>Communicate clearly</span><span>Finish completely</span></div>
      </section>
      <section className="stories-estimate" id="estimate">
        <div><h2>What should we build next?</h2><p>Tell us where you are in the process. A first conversation can be simple.</p></div>
        <DemoForm compact />
      </section>
    </main>
  )
}

function StandardPage({ navigate }) {
  return (
    <main className="standard-page" id="top">
      <BackBar navigate={navigate} tone="standard" />
      <nav className="standard-nav">
        <BrandMark />
        <div><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a></div>
        <a className="standard-nav__cta" href="#estimate">Request an estimate</a>
      </nav>
      <section className="standard-hero">
        <div className="standard-hero__copy"><h1>A better way to build.</h1><p>Thoughtful renovations, additions, and new homes—managed from first conversation to final walkthrough.</p><div><a href="#estimate">Request an estimate <ArrowRight size={18} /></a><a href="#projects">View our work</a></div></div>
        <img src="/images/project-kitchen.webp" alt="Completed warm kitchen renovation" />
      </section>
      <section className="standard-services" id="services">
        <div className="standard-section-head"><h2>How can we help?</h2><p>Clear scope. Capable hands. One team accountable for the details.</p></div>
        <div className="standard-services__grid">
          {[['Renovations','Reimagine the home you have.'],['Additions','Create space without compromise.'],['New builds','Build the right home from the start.']].map(([title,copy],index)=><article key={title}><span>{index+1}</span><h3>{title}</h3><p>{copy}</p><a href="#estimate">Discuss your project <ArrowRight size={16}/></a></article>)}
        </div>
      </section>
      <section className="standard-projects" id="projects">
        <img src="/images/project-exterior.webp" alt="Modern craftsman home exterior" />
        <img src="/images/project-addition.webp" alt="Light-filled living room addition" />
        <div><h2>Built for everyday life.</h2><p>We focus on the decisions that make a home work better—light, flow, proportion, durability, and the details you touch every day.</p></div>
      </section>
      <section className="standard-process" id="process"><h2>A clear process from start to finish.</h2><ol><li><b>Consult</b><span>Understand the project and your priorities.</span></li><li><b>Plan</b><span>Define scope, selections, and sequence.</span></li><li><b>Build</b><span>Coordinate the work and communicate clearly.</span></li><li><b>Complete</b><span>Walk through every detail together.</span></li></ol></section>
      <section className="standard-estimate" id="estimate"><div><h2>Ready to talk about your project?</h2><p>Share a few details and make the first conversation easy.</p></div><DemoForm theme="light" /></section>
    </main>
  )
}

function App() {
  const [path, navigate] = useRoute()
  const [bookingOpen, setBookingOpen] = useState(false)
  const openBooking = useCallback(() => setBookingOpen(true), [])
  const closeBooking = useCallback(() => setBookingOpen(false), [])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    if (!query.toString()) return

    const properties = {
      path: window.location.pathname,
      query: query.toString().slice(0, 500),
    }
    query.forEach((value, key) => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 32)
      if (normalizedKey) properties[`param_${normalizedKey}`] = value.slice(0, 200)
    })
    track('query_parameters', properties)
  }, [path])
  useEffect(() => {
    const palettes = {
      '/field-book': ['#a84932', '#eee7d8'],
      '/project-stories': ['#e76b3c', '#11110f'],
      '/category-standard': ['#d46a32', '#eceae5'],
    }
    const [thumb, track] = palettes[path] || ['#c7653d', '#17211b']
    document.documentElement.style.setProperty('--scroll-thumb', thumb)
    document.documentElement.style.setProperty('--scroll-track', track)
  }, [path])
  let page = <Gallery navigate={navigate} />
  let theme = 'gallery'
  if (path === '/daily-build-log') {
    page = <DailyBuildLog navigate={navigate} />
    theme = 'daily'
  } else if (path === '/field-book') {
    page = <FieldBook navigate={navigate} />
    theme = 'field'
  } else if (path === '/project-stories') {
    page = <ProjectStories navigate={navigate} />
    theme = 'stories'
  } else if (path === '/category-standard') {
    page = <StandardPage navigate={navigate} />
    theme = 'standard'
  }

  return (
    <>
      <BookingBanner theme={theme} onOpen={openBooking} />
      {page}
      <BookingModal open={bookingOpen} onClose={closeBooking} theme={theme} />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Analytics />
  </>,
)

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { Select } from '@/components/Select'
import { Spinner } from '@/components/Spinner'
import { Modal } from '@/components/Modal'
import { AdSlot } from '@/components/AdSlot'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { DepartureAutocomplete } from '@/components/DepartureAutocomplete'
import { DestinationCard } from '@/components/DestinationCard'
import type { Destination as DestinationCardDestination } from '@/components/DestinationCard'
import { DestinationDetailModal } from '@/components/DestinationDetailModal'
import type { Destination } from '@/lib/destinations'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { PricingPlans } from '@/components/PricingPlans'
import { ProGate } from '@/components/ProGate'
import { ResultsReveal } from '@/components/ResultsReveal'
import type { DestinationScore } from '@/lib/scoringEngine'
import { RouteAnnouncer } from '@/components/RouteAnnouncer'
import { BudgetSlider } from '@/components/BudgetSlider'
import { TravelStyleSelector } from '@/components/TravelStyleSelector'
import { TripActions } from '@/components/TripActions'
import { TripForm } from '@/components/TripForm'
import { TripScopeStep } from '@/components/TripScopeStep'
import { UpgradePrompt } from '@/components/UpgradePrompt'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}))

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    id: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    countryCode: 'ID',
    coordinates: { lat: -8.3405, lng: 115.092 },
    continent: 'Asia',
    description: 'A lush island paradise.',
    climate: 'tropical',
    travelStyles: ['beach', 'adventure'],
    bestMonths: [4, 5, 6],
    estimatedCosts: { flightFromEurope: 600, hotelPerNight: 60, dailySpending: 40 },
    activities: ['Surfing', 'Temple hopping'],
    currency: 'IDR',
    visa: 'on-arrival',
    ...overrides,
  }
}

function makeScore(overrides: Partial<DestinationScore> = {}): DestinationScore {
  return {
    destination: makeDestination(),
    totalScore: 87.4,
    styleScore: 1,
    seasonScore: 1,
    budgetScore: 0.8,
    distanceScore: 0.6,
    ...overrides,
  }
}

const destinationCardDestination: DestinationCardDestination = {
  name: 'Bali',
  country: 'Indonesia',
  climate: 'tropical',
  description: 'A lush island paradise.',
  activities: ['Surfing', 'Temple hopping'],
}

describe('accessibility (axe)', () => {
  it('Button has no violations', async () => {
    const { container } = render(<Button>Find my holiday</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Badge has no violations', async () => {
    const { container } = render(<Badge>New</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Card has no violations', async () => {
    const { container } = render(<Card>Card content</Card>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Input has no violations', async () => {
    const { container } = render(<Input id="name" label="Full name" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Slider has no violations', async () => {
    const { container } = render(
      <Slider id="budget" label="Budget" min={0} max={1000} value={500} onChange={vi.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Select has no violations', async () => {
    const { container } = render(
      <Select
        id="style"
        label="Travel style"
        options={[
          { value: 'beach', label: 'Beach' },
          { value: 'city', label: 'City' },
        ]}
        value=""
        onChange={vi.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Spinner has no violations', async () => {
    const { container } = render(<Spinner />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Modal has no violations', async () => {
    const { container } = render(
      <Modal isOpen onClose={vi.fn()} title="Trip details">
        <p>Everything about this trip.</p>
      </Modal>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('AdSlot has no violations', async () => {
    const { container } = render(<AdSlot format="banner" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('DarkModeToggle has no violations', async () => {
    const { container } = render(<DarkModeToggle />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('DepartureAutocomplete has no violations', async () => {
    const { container } = render(
      <DepartureAutocomplete
        id="departure"
        label="Departure city"
        value=""
        onChange={vi.fn()}
        onSelect={vi.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('DestinationCard has no violations', async () => {
    const { container } = render(
      <DestinationCard destination={destinationCardDestination} onSelect={vi.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('DestinationDetailModal has no violations', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(jsonResponse({ source: 'static', avgHighC: 24, description: 'warm' }))
      )
    )
    const { container } = render(
      <DestinationDetailModal
        isOpen
        onClose={vi.fn()}
        destination={makeDestination()}
        distanceKm={500}
        nights={5}
        groupSize={2}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
    vi.unstubAllGlobals()
  })

  it('Footer has no violations', async () => {
    const { container } = render(<Footer />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Header has no violations', async () => {
    const { container } = render(<Header />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Hero has no violations', async () => {
    const { container } = render(<Hero />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('PricingPlans has no violations', async () => {
    const { container } = render(<PricingPlans />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('ProGate has no violations', async () => {
    const { container } = render(
      <ProGate status="free" feature="save-trip" onUpgrade={vi.fn()}>
        <p>Unlocked content</p>
      </ProGate>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('ResultsReveal has no violations', async () => {
    const { container } = render(<ResultsReveal recommendation={makeScore()} onShuffle={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('RouteAnnouncer has no violations', async () => {
    const { container } = render(<RouteAnnouncer />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('BudgetSlider has no violations', async () => {
    const { container } = render(<BudgetSlider value={1000} onChange={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TravelStyleSelector has no violations', async () => {
    const { container } = render(<TravelStyleSelector selected={[]} onChange={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TripActions has no violations', async () => {
    const { container } = render(<TripActions destinationName="Bali, Indonesia" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TripForm has no violations', async () => {
    const { container } = render(<TripForm />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TripScopeStep has no violations', async () => {
    const { container } = render(
      <TripScopeStep
        maxDistance={5000}
        onMaxDistanceChange={vi.fn()}
        groupSize={2}
        onGroupSizeChange={vi.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('UpgradePrompt has no violations', async () => {
    const { container } = render(<UpgradePrompt feature="save-trip" onUpgrade={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

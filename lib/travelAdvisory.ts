import safetyOverridesData from './data/safety-overrides.json'

/**
 * `exclude` — FCDO advises against all/essential travel to the destination's country; never
 * picked. `warn` — FCDO advises against travel to parts of the country; pickable, with a
 * warning. `ok` — no FCDO warnings cover the destination.
 *
 * Covers any FCDO advisory (conflict, disaster, outbreak, entry ban), not just conflict — see
 * ROADMAP.md feature 9.
 */
export type SafetyStatus = 'exclude' | 'warn' | 'ok'

export interface SafetyOverride {
  status: SafetyStatus
  /** Human-readable explanation, shown to users and linking context for a warning badge. */
  reason: string
  /** ISO date (YYYY-MM-DD) the override was last checked against FCDO advice. */
  date: string
}

/**
 * Hand-seeded overrides for destinations with known FCDO advisories, keyed by destination id.
 * A destination with no entry here has no FCDO warnings (`ok`). Edit by hand for now; a daily
 * sync against the GOV.UK content API is planned (ROADMAP.md feature 9).
 */
const safetyOverrides = safetyOverridesData as Record<string, SafetyOverride>

/** Full override record for a destination, or `undefined` when none applies (status `ok`). */
export function getSafetyOverride(destinationId: string): SafetyOverride | undefined {
  return safetyOverrides[destinationId]
}

/** A destination's safety status. Destinations with no override are `ok`. */
export function getSafetyStatus(destinationId: string): SafetyStatus {
  return safetyOverrides[destinationId]?.status ?? 'ok'
}

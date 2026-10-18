const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

/** Formats a GBP amount as whole pounds, e.g. `£1,200`. */
export function formatGbp(value: number): string {
  return gbpFormatter.format(value)
}

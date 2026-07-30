/** Path to a destination's local photo. Files are optional — add them to /public/destinations. */
export function getDestinationImagePath(destinationId: string): string {
  return `/destinations/${destinationId}.jpg`
}

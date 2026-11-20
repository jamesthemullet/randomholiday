import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue'

// ISR cache in R2 (bucket bound as NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc), so pages with
// `revalidate` — the homepage's daily hero photo — re-render on Cloudflare. The memory queue
// revalidates through the WORKER_SELF_REFERENCE service binding.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: memoryQueue,
})

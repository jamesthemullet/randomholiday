// Builds lib/data/destination-photos.json: the ids of every destination with a photo in
// public/destinations. The Worker can't list public/ at runtime, so code that needs to know which
// photos exist (the daily homepage hero) reads this list instead.
//
// Runs before every `yarn build`; run it yourself with `yarn data:photos` after adding photos so
// the committed list (and the test that checks it) stays in sync.

/* eslint-disable no-console -- a CLI script that reports its progress */

import { readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const PHOTOS_DIR = fileURLToPath(new URL('../public/destinations/', import.meta.url))
const OUTPUT = fileURLToPath(new URL('../lib/data/destination-photos.json', import.meta.url))

const ids = (await readdir(PHOTOS_DIR))
  .filter((file) => file.endsWith('.jpg'))
  .map((file) => file.slice(0, -'.jpg'.length))
  .sort()

await writeFile(OUTPUT, `${JSON.stringify(ids, null, 2)}\n`)
console.log(`Wrote ${ids.length} destination photo ids to lib/data/destination-photos.json`)

// Builds lib/data/london-destinations.json: every destination with a scheduled direct flight
// from a London airport, with only the facts that can be looked up rather than written —
// name, country, coordinates, continent, currency, and the London airports/airlines serving it.
//
// Routes come from each airport's "Airlines and destinations" table on English Wikipedia
// (CC BY-SA); country, coordinates and currency come from Wikidata (CC0).
//
// Usage: yarn data:london

/* eslint-disable no-console -- a CLI script that reports its progress */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OUTPUT = fileURLToPath(new URL('../lib/data/london-destinations.json', import.meta.url))
const USER_AGENT =
  'RandomHolidayRouteResearch/0.1 (https://github.com/jamesthemullet/randomholiday)'

const LONDON_AIRPORTS = {
  LHR: 'Heathrow Airport',
  LGW: 'Gatwick Airport',
  STN: 'London Stansted Airport',
  LTN: 'Luton Airport',
  LCY: 'London City Airport',
  SEN: 'London Southend Airport',
}

// The app groups these countries as "Middle East" rather than by Wikidata's continent.
const MIDDLE_EAST = new Set([
  'AE',
  'BH',
  'IL',
  'IQ',
  'IR',
  'JO',
  'KW',
  'LB',
  'OM',
  'PS',
  'QA',
  'SA',
  'SY',
  'TR',
  'YE',
])

// Wikidata has no currency for these territories; they use their parent country's.
const CURRENCY_OVERRIDES = { IM: 'GBP', JE: 'GBP', GG: 'GBP', FO: 'DKK' }

// Airport-specific names Wikipedia uses that don't split on an en dash.
const NAME_OVERRIDES = { 'Tenerife-South': 'Tenerife' }

const CONTINENTS = {
  Q46: 'Europe',
  Q15: 'Africa',
  Q48: 'Asia',
  Q49: 'Americas',
  Q18: 'Americas',
  Q538: 'Oceania',
  Q55643: 'Oceania',
  Q3960: 'Oceania',
}
// When a country spans several continents (Russia, Egypt, Turkey…), the first match wins.
const CONTINENT_PRIORITY = ['Europe', 'Africa', 'Americas', 'Oceania', 'Asia']

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Wikimedia rate-limits bursts, so requests are spaced out and retried on a 429.
async function getJson(url, attempt = 1) {
  await sleep(1000)
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (response.status === 429 && attempt < 5) {
    await sleep(5000 * attempt)
    return getJson(url, attempt + 1)
  }
  if (!response.ok) throw new Error(`${response.status} for ${url}`)
  return response.json()
}

function chunk(items, size) {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

function stripRefsAndComments(text) {
  return text
    .replace(/<ref[^>/]*\/>/g, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

/** Returns the bodies of every {{name ...}} template, honouring nested braces. */
function findTemplates(text, name) {
  const bodies = []
  let start = text.indexOf(`{{${name}`)
  while (start >= 0) {
    let depth = 0
    let i = start
    while (i < text.length) {
      if (text.startsWith('{{', i)) {
        depth++
        i += 2
      } else if (text.startsWith('}}', i)) {
        depth--
        i += 2
        if (depth === 0) break
      } else {
        i++
      }
    }
    bodies.push(text.slice(start + 2 + name.length, i - 2))
    start = text.indexOf(`{{${name}`, i)
  }
  return bodies
}

/** Splits template parameters on top-level pipes (not those inside links or nested templates). */
function splitTopLevel(text) {
  const parts = []
  let depth = 0
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const two = text.slice(i, i + 2)
    if (two === '{{' || two === '[[') {
      depth++
      current += two
      i++
    } else if (two === '}}' || two === ']]') {
      depth--
      current += two
      i++
    } else if (text[i] === '|' && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += text[i]
    }
  }
  parts.push(current)
  return parts.map((part) => part.trim()).filter(Boolean)
}

const LINK = /\[\[([^\]|]+)\|?([^\]]*)\]\]/g

/** Returns route entries for one airport: { name, article, airline, seasonal } per destination link. */
function parseAirportRoutes(wikitext) {
  const start = wikitext.indexOf('Airlines and destinations==')
  if (start < 0) throw new Error('No "Airlines and destinations" section')
  const cargo = wikitext.indexOf('\n===Cargo', start)
  const section = stripRefsAndComments(wikitext.slice(start, cargo > 0 ? cargo : undefined))

  const routes = []
  for (const body of findTemplates(section, 'Airport destination list')) {
    // Named parameters (e.g. 3rdcoltitle=) aren't airline/destination cells.
    const cells = splitTopLevel(body).filter((cell) => !/^[\w ]+=/.test(cell))
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const airline = [...cells[i].matchAll(LINK)].map((m) => m[2] || m[1])[0] ?? cells[i]
      // Bold labels split the cell into regular, "Seasonal:" and "Charter:" groups.
      const segments = cells[i + 1].split(/'''\s*([^']+?)\s*:?\s*'''/)
      const groups = [['regular', segments[0]]]
      for (let s = 1; s + 1 < segments.length; s += 2) groups.push([segments[s], segments[s + 1]])
      for (const [label, text] of groups) {
        const kind = label.toLowerCase()
        if (kind.includes('charter')) continue
        for (const match of text.matchAll(LINK)) {
          routes.push({
            name: (match[2] || match[1]).trim(),
            article: match[1].trim(),
            airline: airline.trim(),
            seasonal: kind !== 'regular',
          })
        }
      }
    }
  }
  return routes
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function claimIds(entity, property) {
  return (entity.claims?.[property] ?? [])
    .filter((claim) => claim.rank !== 'deprecated' && claim.mainsnak.datavalue)
    .sort((a, b) => (b.rank === 'preferred') - (a.rank === 'preferred'))
    .map((claim) => claim.mainsnak.datavalue.value)
}

/**
 * A country's ISO 3166-1 alpha-2 code. Falls back to a deprecated claim because Wikidata moved
 * "NL" from the Netherlands to the Kingdom of the Netherlands, which airports don't reference.
 */
function isoCode(country) {
  const current = claimIds(country, 'P297')[0]
  if (current) return current
  return (country.claims?.P297 ?? []).find((claim) => claim.mainsnak.datavalue)?.mainsnak.datavalue
    .value
}

async function getEntities(ids) {
  const entities = {}
  // Country entities are very large, so batches stay small to keep responses manageable.
  for (const batch of chunk([...new Set(ids)], 10)) {
    const data = await getJson(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch.join('|')}&props=claims|labels&languages=en&format=json`
    )
    if (data.error) throw new Error(`Wikidata: ${data.error.info}`)
    Object.assign(entities, data.entities)
  }
  return entities
}

async function main() {
  // 1. Every route from every London airport, keyed by the destination airport's article.
  const byArticle = new Map()
  for (const [code, page] of Object.entries(LONDON_AIRPORTS)) {
    const data = await getJson(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&redirects=1`
    )
    const routes = parseAirportRoutes(data.parse.wikitext['*'])
    console.log(`${code}: ${new Set(routes.map((r) => r.name)).size} destinations`)
    for (const route of routes) {
      const entry = byArticle.get(route.article) ?? {
        name: route.name,
        article: route.article,
        airports: new Set(),
        airlines: new Set(),
        yearRound: false,
      }
      entry.airports.add(code)
      entry.airlines.add(route.airline)
      if (!route.seasonal) entry.yearRound = true
      byArticle.set(route.article, entry)
    }
  }

  // 2. Resolve each destination airport's article to its Wikidata item.
  const articles = [...byArticle.keys()]
  const qidByArticle = new Map()
  for (const batch of chunk(articles, 50)) {
    const data = await getJson(
      `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&titles=${encodeURIComponent(batch.join('|'))}&format=json`
    )
    // Follows each requested title forwards (normalisation, then redirect) to its page, since
    // several requested titles can redirect to the same page.
    const normalized = new Map((data.query.normalized ?? []).map((n) => [n.from, n.to]))
    const redirects = new Map((data.query.redirects ?? []).map((r) => [r.from, r.to]))
    const qidByTitle = new Map(
      Object.values(data.query.pages).map((page) => [page.title, page.pageprops?.wikibase_item])
    )
    for (const article of batch) {
      const title = normalized.get(article) ?? article
      const qid = qidByTitle.get(redirects.get(title) ?? title)
      if (qid) qidByArticle.set(article, qid)
    }
  }

  // 3. Airport → country + coordinates; country → ISO code, continent, currency.
  const airports = await getEntities([...qidByArticle.values()])
  const airportCountryIds = (airport) => claimIds(airport, 'P17').map((v) => v.id)
  const countries = await getEntities(Object.values(airports).flatMap(airportCountryIds))
  const currencyIds = Object.values(countries).flatMap((c) =>
    claimIds(c, 'P38')
      .slice(0, 1)
      .map((v) => v.id)
  )
  const currencies = await getEntities(currencyIds)

  // 4. One destination per city: "Paris–Orly" and "Paris–Charles de Gaulle" become "Paris".
  const destinations = new Map()
  const skipped = []
  for (const entry of byArticle.values()) {
    const qid = qidByArticle.get(entry.article)
    const airport = qid && airports[qid]
    // The first country claim with an ISO code (e.g. skipping a historical or umbrella state).
    const country =
      airport &&
      airportCountryIds(airport)
        .map((id) => countries[id])
        .find((c) => c && isoCode(c))
    const coords = airport && claimIds(airport, 'P625')[0]
    const countryCode = country && isoCode(country)
    if (!country || !coords || !countryCode) {
      const reason = !qid ? 'no Wikidata item' : !coords ? 'no coordinates' : 'no ISO country'
      skipped.push(`${entry.name} (${reason})`)
      continue
    }
    const continentNames = claimIds(country, 'P30')
      .map((v) => CONTINENTS[v.id])
      .filter(Boolean)
    const continent = MIDDLE_EAST.has(countryCode)
      ? 'Middle East'
      : (CONTINENT_PRIORITY.find((c) => continentNames.includes(c)) ?? null)
    const currencyId = claimIds(country, 'P38')[0]?.id
    const currency =
      CURRENCY_OVERRIDES[countryCode] ??
      ((currencyId && claimIds(currencies[currencyId] ?? {}, 'P498')[0]) || null)
    const shortName = entry.name.split('–')[0].trim()
    const name = NAME_OVERRIDES[shortName] ?? shortName
    const countryName = country.labels.en.value
    const id = `${slugify(name)}-${slugify(countryName)}`

    const existing = destinations.get(id)
    if (existing) {
      entry.airports.forEach((a) => existing.london.airports.add(a))
      entry.airlines.forEach((a) => existing.london.airlines.add(a))
      existing.london.seasonalOnly &&= !entry.yearRound
      continue
    }
    destinations.set(id, {
      id,
      name,
      country: countryName,
      countryCode,
      coordinates: {
        lat: Math.round(coords.latitude * 1e4) / 1e4,
        lng: Math.round(coords.longitude * 1e4) / 1e4,
      },
      continent,
      currency,
      london: {
        airports: new Set(entry.airports),
        airlines: new Set(entry.airlines),
        seasonalOnly: !entry.yearRound,
      },
    })
  }

  const output = [...destinations.values()]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((d) => ({
      ...d,
      london: {
        direct: true,
        airports: [...d.london.airports].sort(),
        airlines: [...d.london.airlines].sort(),
        seasonalOnly: d.london.seasonalOnly,
      },
    }))

  await writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n')
  console.log(
    `${byArticle.size} destination airports → ${output.length} destinations written to ${OUTPUT}`
  )
  if (skipped.length)
    console.log(`Skipped (no Wikidata country/coordinates): ${skipped.join(', ')}`)
  const noContinent = output.filter((d) => !d.continent).map((d) => d.name)
  if (noContinent.length) console.log(`No continent: ${noContinent.join(', ')}`)
  const noCurrency = output.filter((d) => !d.currency).map((d) => d.name)
  if (noCurrency.length) console.log(`No currency: ${noCurrency.join(', ')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

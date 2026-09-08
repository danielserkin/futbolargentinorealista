import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const site = 'https://futbolrealista.com.ar'
const growth = new URL('../.growth/', import.meta.url)
const validKey = (key) => /^[a-zA-Z0-9-]{8,128}$/.test(key)

async function getPublished(path) {
  const response = await fetch(`${site}${path}`, { signal: AbortSignal.timeout(20000), headers: { 'Cache-Control': 'no-cache' } })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Published ${path}: HTTP ${response.status}`)
  return response.text()
}

export function changedUrls(previous, current) {
  return [...new Set([...Object.keys(previous), ...Object.keys(current)])]
    .filter((path) => previous[path] !== current[path])
    .map((path) => {
      if (!path.startsWith('/') || path.startsWith('//') || path.includes('?') || path.includes('#')) throw new Error('Invalid search manifest path')
      const url = new URL(path, site)
      if (url.origin !== site || !['/', '/novedades.html', '/clubes/'].includes(path) && !/^\/clubes\/[a-z0-9-]+\.html$/.test(path)) throw new Error('Search URL outside supported content')
      return url.toString()
    })
}

export async function prepare() {
  const [keyText, manifestText] = await Promise.all([getPublished('/indexnow-key.txt'), getPublished('/search-manifest.json')])
  const key = keyText?.trim() ?? randomBytes(16).toString('hex')
  if (!validKey(key)) throw new Error('Published IndexNow key has an invalid format')
  await mkdir(growth, { recursive: true })
  await writeFile(new URL('../public/indexnow-key.txt', import.meta.url), `${key}\n`)
  await writeFile(new URL('previous-search.json', growth), JSON.stringify(manifestText ? JSON.parse(manifestText) : {}))
  console.log(`Prepared search notification baseline; ${keyText ? 'preserved' : 'created'} domain verification file.`)
}

export async function notify() {
  const previous = JSON.parse(await readFile(new URL('previous-search.json', growth), 'utf8'))
  const current = JSON.parse(await readFile(new URL('current-search.json', growth), 'utf8'))
  const urls = changedUrls(previous, current)
  if (!urls.length) {
    console.log('IndexNow: no content changes; no URLs submitted.')
    return
  }
  const [keyText, liveManifestText] = await Promise.all([getPublished('/indexnow-key.txt'), getPublished('/search-manifest.json')])
  const key = keyText?.trim()
  if (!key || !validKey(key)) throw new Error('Domain verification file is not published yet')
  const liveManifest = liveManifestText ? JSON.parse(liveManifestText) : {}
  if (JSON.stringify(liveManifest) !== JSON.stringify(current)) throw new Error('Published content does not match this build; notification stopped')
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/indexnow-key.txt`, urlList: urls }),
  })
  const receipt = { at: new Date().toISOString(), status: response.status, urls, accepted: [200, 202].includes(response.status), indexed: 'not_verified' }
  await writeFile(new URL('indexnow-receipt.json', growth), JSON.stringify(receipt, null, 2) + '\n')
  if (!receipt.accepted) throw new Error(`IndexNow HTTP ${response.status}; no automatic retry. Check .growth/indexnow-receipt.json.`)
  console.log(`IndexNow HTTP ${response.status}: received ${urls.length} changed URLs. Indexing and visits are not confirmed.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === 'prepare') await prepare()
  else if (process.argv[2] === 'notify') await notify()
  else throw new Error('Usage: node scripts/search-indexing.mjs prepare|notify')
}

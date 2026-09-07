import { access, readFile } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const index = await readFile(new URL('index.html', dist), 'utf8')
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8')
const requiredPages = ['metodologia.html', 'formato.html', 'herramientas.html', 'temporada-2025-26.html']

if (index.includes('<div id="root"></div>')) throw new Error('Homepage root is empty after prerender')
if (!index.includes('Una tabla comparable, no otro torneo inventado')) throw new Error('Editorial homepage content is missing')
if (!index.includes('name="google-adsense-account"')) throw new Error('AdSense verification meta tag is missing')
if (index.includes('pagead2.googlesyndication.com') || index.includes('class="adsbygoogle"')) {
  throw new Error('Homepage requests or renders ads during review')
}

for (const page of requiredPages) {
  await access(new URL(page, dist))
  if (!sitemap.includes(`/${page}`)) throw new Error(`${page} is missing from sitemap.xml`)
}

console.log('Validated prerendered content, AdSense review mode and editorial URLs.')

import { readFile, rm, writeFile } from 'node:fs/promises'

const outputUrl = new URL('../dist/index.html', import.meta.url)
const serverUrl = new URL('../.prerender/entry-server.js', import.meta.url)
const { render } = await import(serverUrl.href)
const html = await readFile(outputUrl, 'utf8')
const marker = '<div id="root"></div>'

if (!html.includes(marker)) throw new Error('Prerender marker was not found in dist/index.html')

await writeFile(outputUrl, html.replace(marker, `<div id="root">${render()}</div>`))
await rm(new URL('../.prerender/', import.meta.url), { recursive: true, force: true })
console.log('Prerendered the homepage into dist/index.html.')

import { Resvg } from '@resvg/resvg-js'

const escapeXml = (value) => String(value).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char])

export function socialCard({ title, subtitle, stats = [], footer }) {
  const lines = ['']
  for (const word of title.split(' ')) {
    const index = lines.length - 1
    if (`${lines[index]} ${word}`.trim().length > 31 && lines[index]) lines.push(word)
    else lines[index] = `${lines[index]} ${word}`.trim()
  }
  if (title === 'Fútbol argentino. Pero bien hecho.') lines.splice(0, lines.length, 'Fútbol argentino.', 'Pero bien hecho.')
  if (lines.length > 3) throw new Error(`Social card title is too long: ${title}`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#07111f"/>
    <path d="M0 6H400M800 6H1200" stroke="#70c9f1" stroke-width="12"/><path d="M400 6H800" stroke="#f4f7fa" stroke-width="12"/>
    <g fill="none" stroke="#17384e" stroke-width="2"><circle cx="1090" cy="180" r="130"/><circle cx="1090" cy="180" r="160"/><circle cx="1090" cy="180" r="190"/></g>
    <g font-family="DejaVu Sans" fill="#eff5fa">
      <text x="64" y="78" font-size="22" letter-spacing="3" fill="#70c9f1">FÚTBOL ARGENTINO REALISTA</text>
      ${lines.map((line, i) => `<text x="60" y="${170 + i * 66}" font-size="58" font-weight="bold">${escapeXml(line)}</text>`).join('')}
      <text x="64" y="355" font-size="24" fill="#a9bdcc">${escapeXml(subtitle)}</text>
      ${stats.map((stat, i) => `<rect x="${64 + i * 360}" y="393" width="336" height="116" rx="8" fill="#102538"/><text x="${84 + i * 360}" y="446" font-size="36" font-weight="bold">${escapeXml(stat.value)}</text><text x="${84 + i * 360}" y="483" font-size="17" fill="#8dc7e4">${escapeXml(stat.label)}</text>`).join('')}
      <text x="64" y="566" font-size="21" fill="#a9bdcc">${escapeXml(footer)}</text>
      <text x="64" y="604" font-size="18" fill="#70c9f1">futbolrealista.com.ar · Tabla alternativa, no oficial</text>
    </g>
  </svg>`
  return new Resvg(svg, { font: { defaultFontFamily: 'DejaVu Sans', loadSystemFonts: true } }).render().asPng()
}

import { useState } from 'react'
import { campaignUrl, shareLinks } from './discovery'

export function ShareLinks({ path, text }: { path: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const links = shareLinks(path, text)
  const copy = async () => {
    const url = campaignUrl(path, 'enlace')
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch { window.prompt('Copiá este enlace', url) }
  }
  return <div className="share-links" aria-label="Compartir">
    <span>Compartí el debate</span>
    <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
    <a href={links.x} target="_blank" rel="noopener noreferrer">X</a>
    <button onClick={copy} aria-live="polite">{copied ? 'Enlace copiado' : 'Copiar enlace'}</button>
  </div>
}

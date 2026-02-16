import type { ReactNode } from 'react'
import { withBaseUrl } from '@/utils/assetUrl'

interface DataLibraryImageProps {
  imageUrl: string | null
  alt: string
  className: string
}

export function DataLibraryImage({ imageUrl, alt, className }: DataLibraryImageProps): ReactNode {
  const src = withBaseUrl(imageUrl)
  if (!src) {
    return (
      <div className={`${className} placeholder`} aria-hidden>
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }
  const placeholderChar = alt.charAt(0).toUpperCase()
  const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#2a2a3e"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="#8b5a2b" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${placeholderChar}</text></svg>`
  const placeholderDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.currentTarget
        target.onerror = null
        target.src = placeholderDataUrl
        target.classList.add('placeholder')
      }}
    />
  )
}

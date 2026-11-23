import type { ImgHTMLAttributes } from 'react'

type CoverProps = {
  url: string | null
  /** Shown behind the image while it loads, and as the placeholder when there is none. */
  color?: string | null
  /** Empty by default: covers sit next to their title, so they're decorative. */
  alt?: string
  className?: string
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading']
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>['fetchPriority']
}

/** A cover image, or a blank placeholder in the cover's color. */
export default function Cover({ url, color, alt = '', className, loading = 'lazy', fetchPriority }: CoverProps) {
  const classes = className ? `cover ${className}` : 'cover'
  const style = color ? { backgroundColor: color } : undefined
  return url ? (
    <img className={classes} src={url} alt={alt} loading={loading} fetchPriority={fetchPriority} style={style} />
  ) : (
    <span className={classes} aria-hidden="true" style={style} />
  )
}

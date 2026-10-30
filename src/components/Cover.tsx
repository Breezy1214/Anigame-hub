/** A decorative cover image (the title is always shown next to it), or a blank placeholder. */
export default function Cover({ url }: { url: string | null }) {
  return url ? <img className="cover" src={url} alt="" loading="lazy" /> : <span className="cover" aria-hidden="true" />
}

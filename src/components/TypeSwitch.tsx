import { MEDIA_TAB_LABELS, MEDIA_TYPES, type MediaType } from '../lib/media'

/** The anime/games switch; the pressed side fills with its media type's color. */
export default function TypeSwitch({ value, onChange }: { value: MediaType; onChange: (type: MediaType) => void }) {
  return (
    <div className="type-switch" role="group" aria-label="Media type">
      {MEDIA_TYPES.map((type) => (
        <button key={type} type="button" data-type={type} aria-pressed={type === value} onClick={() => onChange(type)}>
          {MEDIA_TAB_LABELS[type]}
        </button>
      ))}
    </div>
  )
}

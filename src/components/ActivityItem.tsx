import { Trash2 } from 'lucide-react'
import type { Activity } from '../types/trip'
import { Button } from './Button'

/** Egy teendő megjelenítési adata és a napkártya által biztosított eseményei. */
interface ActivityItemProps {
  /** A teendő aktuális címe és készültségi állapota. */
  activity: Activity
  /** A completed érték megfordításának kérése. */
  onToggle: () => void
  /** A teendő eltávolításának kérése. */
  onDelete: () => void
}

/**
 * Egy teendő sora kontrollált jelölőnégyzettel és törlőikonnal.
 * @returns Listaelem, amely a kész teendőket áthúzott szöveggel különbözteti meg.
 * @remarks A checked mindig a kapott adatból származik; a valódi állapotváltást a szülő végzi.
 * A label a teendő címét a jelölőnégyzethez kapcsolja, így a szöveg is kattintható.
 */
export function ActivityItem({
  activity,
  onToggle,
  onDelete,
}: ActivityItemProps) {
  // A címhez kapcsolt aria-label megkülönbözteti az azonos ikonú törlőgombokat.
  return (
    <li className="activity-item">
      <label className={activity.completed ? 'completed' : ''}>
        <input
          type="checkbox"
          checked={activity.completed}
          onChange={onToggle}
        />
        <span>{activity.title}</span>
      </label>
      <Button
        variant="icon"
        title={'Program törlése'}
        aria-label={`${activity.title}: törlés`}
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </Button>
    </li>
  )
}

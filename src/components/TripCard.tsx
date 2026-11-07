import { ArrowUpRight, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import type { Trip } from '../types/trip'
import { formatDate, formatMoney } from '../utils/trip'
import { Button } from './Button'
import { Card } from './Card'

/** Egyetlen kártya útadata és a szülő által az adott úthoz kötött parancsok. */
interface TripCardProps {
  /** A megjelenítendő út. */
  trip: Trip
  /** Részletes nézet megnyitása. */
  onSelect: () => void
  /** Szerkesztőűrlap megnyitása. */
  onEdit: () => void
  /** Törlési kérés; a megerősítést az App végzi. */
  onDelete: () => void
}

/**
 * Egy út rövid áttekintése dátummal, kerettel és felhasználási sávval.
 * @returns Önálló kártya külön megnyitási, szerkesztési és törlési gombokkal.
 * @remarks A kártya nem ment adatot; a szülőhöz továbbítja a felhasználói parancsot.
 */
export function TripCard({ trip, onSelect, onEdit, onDelete }: TripCardProps) {
  // A kiadások összege származtatott érték; új költséglistánál automatikusan újraszámolódik.
  const spent = trip.expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )
  return (
    <Card className="trip-card">
      {/* Általános utazási dekoráció, nem városfotó; az üres alt miatt a képernyőolvasó kihagyja. */}
      <img
        className="trip-card-image"
        src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=700&q=80"
        alt=""
        loading="lazy"
      />
      <div className="trip-card-top">
        <CalendarDays size={22} />
        <div className="actions">
          <Button
            variant="icon"
            title={'Szerkesztés'}
            aria-label={`${trip.destination}: szerkesztés`}
            onClick={onEdit}
          >
            <Pencil size={17} />
          </Button>
          <Button
            variant="icon"
            title={'Törlés'}
            aria-label={`${trip.destination}: törlés`}
            onClick={onDelete}
          >
            <Trash2 size={17} />
          </Button>
        </div>
      </div>
      <h2>
        <button className="text-link" onClick={onSelect}>
          {trip.destination}
          <ArrowUpRight size={21} />
        </button>
      </h2>
      <p className="muted">
        {formatDate(trip.startDate)}
        {' – '}
        {formatDate(trip.endDate)} · {trip.startDate.slice(0, 4)}
      </p>
      <div className="trip-card-budget">
        <span>{'Keret'}</span>
        <strong>{formatMoney(trip.budget)}</strong>
      </div>
      {/* Nulla keretnél is pozitív max kell; a sáv telítődik, a túlköltést külön szín jelzi. */}
      <progress
        className={spent > trip.budget ? 'over-budget' : ''}
        value={Math.min(spent, trip.budget || 1)}
        max={trip.budget || 1}
        aria-label={'Felhasznált keret'}
      />
      <p className="muted small">
        {formatMoney(spent)} {'elköltve'}
      </p>
    </Card>
  )
}

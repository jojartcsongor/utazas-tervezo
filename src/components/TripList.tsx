import { Luggage } from 'lucide-react'
import type { Trip } from '../types/trip'
import { formatMoney } from '../utils/trip'
import { TripCard } from './TripCard'

/** A listához szükséges útadatok és a kártyák által kiváltott események. */
interface TripListProps {
  /** Az Appban tárolt, megjelenítendő útlista. */
  trips: Trip[]
  /** Útazonosító alapján megnyitja a részletes nézetet. */
  onSelect: (id: string) => void
  /** A választott út adataival nyitja a szerkesztőűrlapot. */
  onEdit: (trip: Trip) => void
  /** Törlési kérést továbbít a központi állapotkezelőnek. */
  onDelete: (id: string) => void
}

/**
 * Az összes mentett utat kártyákon jeleníti meg, közös pénzügyi összesítéssel.
 * @returns Útlista vagy üres állapot; mindkettőnél látható összesítő fejléc.
 * @remarks Az összesítő értékek a propsból származnak, nincs külön szinkronizálandó state.
 */
export function TripList({ trips, onSelect, onEdit, onDelete }: TripListProps) {
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{'A KÖVETKEZŐ MEGÁLLÓ'}</p>
          <h1>{'Utazásaim'}</h1>
        </div>
        <Luggage size={38} className="accent-icon" />
      </div>
      {/* A reduce összegzi a kereteket; a kiadásoknál a belső reduce előbb egy út költségeit adja össze. */}
      <div className="overview-strip">
        <div>
          <span>{'Utazások'}</span>
          <strong>{trips.length}</strong>
        </div>
        <div>
          <span>{'Tervezett keret'}</span>
          <strong>
            {formatMoney(trips.reduce((sum, trip) => sum + trip.budget, 0))}
          </strong>
        </div>
        <div>
          <span>{'Összes kiadás'}</span>
          <strong>
            {formatMoney(
              trips.reduce(
                (sum, trip) =>
                  sum +
                  trip.expenses.reduce(
                    (total, expense) => total + expense.amount,
                    0,
                  ),
                0,
              ),
            )}
          </strong>
        </div>
      </div>
      {/* Stabil id a React key; a callbackek az adott kártya útját vagy azonosítóját kötik az eseményhez. */}
      {trips.length ? (
        <div className="trip-grid">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onSelect={() => onSelect(trip.id)}
              onEdit={() => onEdit(trip)}
              onDelete={() => onDelete(trip.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Luggage size={42} />
          <h2>{'Még nincs utazás'}</h2>
        </div>
      )}
    </main>
  )
}

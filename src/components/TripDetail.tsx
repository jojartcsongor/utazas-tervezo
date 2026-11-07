import { CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react'
import type { Trip } from '../types/trip'
import { formatDate } from '../utils/trip'
import { Button } from './Button'
import { ExpenseTracker } from './ExpenseTracker'
import { ItineraryPlanner } from './ItineraryPlanner'
import { WeatherWidget } from './WeatherWidget'

/** A részletes oldal adata és az App központi műveletei. */
interface TripDetailProps {
  /** A kiválasztott út legfrissebb állapota. */
  trip: Trip
  /** Egy út részleges mezőfrissítését továbbító callback. */
  onUpdate: (id: string, changes: Partial<Trip>) => void
  /** Az út alapadatainak szerkesztése. */
  onEdit: () => void
  /** Az út teljes törlésének kérése. */
  onDelete: () => void
}

/**
 * Összefogja a kiválasztott út időjárását, jegyzeteit, költségeit és napi programjait.
 * @returns Teljes részletes oldal a megfelelő szakterületi gyermekkomponensekkel.
 * @remarks A gyermekek adatváltozásai itt kapják meg az út id-jét, majd az Appba jutnak.
 */
export function TripDetail({
  trip,
  onUpdate,
  onEdit,
  onDelete,
}: TripDetailProps) {
  return (
    <main className="page">
      {/* A widget kulcsa városváltáskor újracsatolást okoz, hogy a helyi lekérési állapot is újrainduljon. */}
      <div className="detail-top">
        <div>
          <p className="eyebrow">
            <MapPin size={15} />
            {'AZ UTAZÁSOD'}
          </p>
          <h1>{trip.destination}</h1>
          <p className="trip-dates">
            <CalendarDays size={17} />
            {trip.startDate.slice(0, 4)} · {formatDate(trip.startDate)}
            {' – '}
            {formatDate(trip.endDate)}
          </p>
          <div className="actions detail-actions">
            <Button onClick={onEdit}>
              <Pencil size={17} />
              {'Szerkesztés'}
            </Button>
            <Button
              variant="icon"
              title={'Utazás törlése'}
              aria-label={'Utazás törlése'}
              onClick={onDelete}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
        <WeatherWidget
          key={`${trip.id}:${trip.destination}`}
          city={trip.destination}
          weather={trip.weather}
          onWeather={(weather) => onUpdate(trip.id, { weather })}
        />
      </div>
      {/* Üres jegyzethez nem hozunk létre külön, tartalom nélküli szakaszt. */}
      {trip.notes && (
        <section className="notes-section">
          <h2>{'Jegyzetek'}</h2>
          <p>{trip.notes}</p>
        </section>
      )}
      {/* Részleges mezőfrissítéskor az út többi adata változatlan marad. */}
      <ExpenseTracker
        expenses={trip.expenses}
        budget={trip.budget}
        onChange={(expenses) => onUpdate(trip.id, { expenses })}
      />
      <ItineraryPlanner
        trip={trip}
        onChange={(itinerary) => onUpdate(trip.id, { itinerary })}
      />
    </main>
  )
}

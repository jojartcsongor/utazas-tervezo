import { CalendarDays, Plus } from 'lucide-react'
import type { ItineraryDay, Trip } from '../types/trip'
import { createItinerary } from '../utils/trip'
import { Button } from './Button'
import { DayCard } from './DayCard'

/**
 * Naponkénti programkártyákat jelenít meg, és kezeli a teljes napi lista frissítését.
 * @returns A napi terv, létrehozási gomb vagy túl hosszú dátumtartományt jelző üzenet.
 * @remarks A trip adata a szülő tulajdona; az onChange mindig egy új naplistát ad vissza.
 */
export function ItineraryPlanner({
  trip,
  onChange,
}: {
  trip: Trip
  onChange: (days: ItineraryDay[]) => void
}) {
  // A kezdő és a zárónap egyaránt része az utazásnak, ezért szükséges a +1.
  const length =
    (Date.parse(trip.endDate) - Date.parse(trip.startDate)) / 86400000 + 1
  return (
    <section className="detail-section" aria-labelledby="itinerary-heading">
      <div className="section-heading">
        <h2 id="itinerary-heading">
          <CalendarDays size={22} />
          {'Napi programok'}
        </h2>
        <span className="muted">
          {length} {'nap'}
        </span>
      </div>
      {/* Egy nap változásakor map cseréli azt az id alapján; a többi nap referenciája megmarad. */}
      {/* Üres mintatervet csak kérésre generálunk, legfeljebb 366 napra. */}
      {trip.itinerary.length ? (
        <div className="day-grid">
          {trip.itinerary.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              onChange={(next) =>
                onChange(
                  trip.itinerary.map((item) =>
                    item.id === next.id ? next : item,
                  ),
                )
              }
            />
          ))}
        </div>
      ) : length <= 366 ? (
        <Button
          onClick={() =>
            onChange(createItinerary(trip.startDate, trip.endDate))
          }
        >
          <Plus size={18} />
          {'Napi terv létrehozása'}
        </Button>
      ) : (
        <p className="error">
          {'A napi terv legfeljebb 366 naphoz hozható létre.'}
        </p>
      )}
    </section>
  )
}

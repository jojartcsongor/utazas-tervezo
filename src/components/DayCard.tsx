import { useState, type SubmitEvent } from 'react'
import { Plus } from 'lucide-react'
import type { ItineraryDay } from '../types/trip'
import { formatDate } from '../utils/trip'
import { ActivityItem } from './ActivityItem'
import { Button } from './Button'
import { Card } from './Card'

/**
 * Egyetlen naptári nap teendőit, készültségét és újprogram-űrlapját jeleníti meg.
 * @returns Napkártya hozzáadási, állapotváltási és törlési vezérlőkkel.
 * @remarks A napi adat a szülőé; csak az új teendő beviteli szövege helyi állapot.
 * Az onChange minden műveletnél egy új napobjektumot továbbít a tervezőnek.
 */
export function DayCard({
  day,
  onChange,
}: {
  day: ItineraryDay
  onChange: (day: ItineraryDay) => void
}) {
  // A még el nem küldött bevitelt nem tároljuk az út adatmodelljében.
  const [title, setTitle] = useState('')

  /**
   * Nem üres cím esetén új, kezdetben befejezetlen teendőt ad a naphoz.
   * @param event - Az újprogram-űrlap beküldési eseménye.
   * @remarks A nap és a teendőlista másolata készül; a régi props nem módosul helyben.
   */
  function add(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    // Az új activity saját azonosítót kap, a nap többi mezőjét a spread megőrzi.
    onChange({
      ...day,
      activities: [
        ...day.activities,
        { id: crypto.randomUUID(), title: title.trim(), completed: false },
      ],
    })
    setTitle('')
  }
  return (
    <Card className="day-card">
      {/* A sorszám kétjegyű; a kész darabszámot a completed mezőre szűrve számítjuk. */}
      <div className="day-heading">
        <span className="day-number">
          {String(day.dayNumber).padStart(2, '0')}
        </span>
        <div>
          <h3>{formatDate(day.date)}</h3>
          <span className="muted small">
            {day.activities.filter((activity) => activity.completed).length}/
            {day.activities.length} {'kész'}
          </span>
        </div>
      </div>
      {/* Pipáláskor map cserél egy elemet, törléskor filter hagyja ki; mindkettő új listát ad. */}
      <ul className="activity-list">
        {day.activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onToggle={() =>
              onChange({
                ...day,
                activities: day.activities.map((item) =>
                  item.id === activity.id
                    ? { ...item, completed: !item.completed }
                    : item,
                ),
              })
            }
            onDelete={() =>
              onChange({
                ...day,
                activities: day.activities.filter(
                  (item) => item.id !== activity.id,
                ),
              })
            }
          />
        ))}
      </ul>
      {/* A napot is tartalmazó aria-label megkülönbözteti az ismétlődő beviteli mezőket. */}
      <form className="activity-form" onSubmit={add}>
        <input
          required
          maxLength={200}
          aria-label={`${day.dayNumber}. nap: új program`}
          placeholder={'Új program'}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Button
          type="submit"
          variant="icon"
          title={'Program hozzáadása'}
          aria-label={'Program hozzáadása'}
        >
          <Plus size={20} />
        </Button>
      </form>
    </Card>
  )
}

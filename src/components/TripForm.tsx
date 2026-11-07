import { useState, type SubmitEvent } from 'react'
import { Save } from 'lucide-react'
import type { Trip } from '../types/trip'
import { createItinerary } from '../utils/trip'
import { Button } from './Button'
import { Modal } from './Modal'

/** Az új és a szerkesztési módot is kiszolgáló útűrlap bemenetei. */
interface TripFormProps {
  /** Meglévő út; hiányában üres mezőkkel új utat készítünk. */
  trip?: Trip
  /** A kész, ellenőrzött út továbbítása a központi állapotkezelésnek. */
  onSave: (trip: Trip) => void
  /** Bezárás mentés nélkül, az eredeti út módosítása nélkül. */
  onClose: () => void
}

/**
 * Új út létrehozására és meglévő út szerkesztésére szolgáló kontrollált űrlap.
 * @returns Modalban megjelenő, mezővalidálással és hibaüzenettel ellátott űrlap.
 * @remarks A mezők ideiglenes helyi állapotban vannak, ezért a Mégse nem módosítja az utat.
 * Dátumváltoztatáskor a megmaradó napok teendőit dátum alapján visszük tovább.
 */
export function TripForm({ trip, onSave, onClose }: TripFormProps) {
  // A kapott út értékei csak az űrlap indulási értékei; gépeléskor helyi state módosul.
  const [destination, setDestination] = useState(trip?.destination ?? '')
  const [startDate, setStartDate] = useState(trip?.startDate ?? '')
  const [endDate, setEndDate] = useState(trip?.endDate ?? '')
  // A számmezőt sztringként tartjuk, mert szerkesztés közben üres értéke is lehet.
  const [budget, setBudget] = useState(String(trip?.budget ?? ''))
  const [notes, setNotes] = useState(trip?.notes ?? '')
  const [error, setError] = useState('')

  /**
   * Ellenőrzi a bevitelt, összeállítja a napi tervet és átadja a kész utat a szülőnek.
   * @param event - Az űrlap beküldési eseménye, amelynek böngészős alapműveletét letiltjuk.
   * @remarks Programvesztés előtt megerősítést kér; hiba esetén az űrlap nyitva marad.
   */
  function submit(event: SubmitEvent<HTMLFormElement>) {
    // Teljes oldalfrissítés helyett a React callback dolgozza fel a beküldést.
    event.preventDefault()
    // A HTML-korlátokon túl a szóközös név és a véges, nem negatív keret is ellenőrzést kap.
    if (
      !destination.trim() ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) < 0
    ) {
      setError('Adj meg érvényes úti célt és keretet.')
      return
    }
    try {
      // A segéd a dátumtartományt is ellenőrzi, ezért hibás tartomány kivételként kezelhető.
      const itinerary = createItinerary(startDate, endDate, trip?.itinerary)
      // Csak programot tartalmazó, kieső nap miatt szükséges adatvesztési megerősítés.
      const removed = trip?.itinerary.some(
        (day) =>
          day.activities.length &&
          !itinerary.some((next) => next.date === day.date),
      )
      if (
        removed &&
        !window.confirm(
          'A dátummódosítás egyes napi programokat töröl. Folytatod?',
        )
      )
        return
      // Új útnál új UUID és üres költséglista kell; másik városnál a régi időjárás érvénytelen.
      onSave({
        id: trip?.id ?? crypto.randomUUID(),
        destination: destination.trim(),
        startDate,
        endDate,
        budget: Number(budget),
        notes: notes.trim(),
        weather: trip?.destination === destination.trim() ? trip.weather : null,
        expenses: trip?.expenses ?? [],
        itinerary,
      })
    } catch (cause) {
      // A catch értéke nem feltétlenül Error, ezért típusellenőrzés után olvassuk a message mezőt.
      setError(cause instanceof Error ? cause.message : 'Hibás adatok.')
    }
  }

  return (
    <Modal title={trip ? 'Utazás szerkesztése' : 'Új utazás'} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        {/* A value és onChange együtt teszik kontrollálttá a mezőt: az érték forrása a state. */}
        <label>
          {'Úti cél'}
          <input
            autoFocus
            required
            maxLength={100}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </label>
        {/* Az érkezés minimuma az indulás, így a natív dátummező is segít a helyes sorrendben. */}
        <div className="form-row">
          <label>
            {'Indulás'}
            <input
              type="date"
              required
              min="0001-01-01"
              max="9999-12-31"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label>
            {'Érkezés'}
            <input
              type="date"
              required
              min={startDate || '0001-01-01'}
              max="9999-12-31"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
        <label>
          {'Költségkeret (Ft)'}
          <input
            type="number"
            required
            min="0"
            max="1000000000000"
            step="1"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
        </label>
        <label>
          {'Jegyzetek'}
          <textarea
            rows={3}
            maxLength={5000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {/* Csak a Mentés submit típusú; a Mégse egyszerű bezárási parancs. */}
        <div className="form-actions">
          <Button onClick={onClose}>{'Mégse'}</Button>
          <Button variant="primary" type="submit">
            <Save size={18} />
            {'Mentés'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

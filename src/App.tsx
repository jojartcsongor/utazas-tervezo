import { useEffect, useRef, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import type { Trip } from './types/trip'
import { loadTrips, saveTrips } from './services/storageService'
import { createItinerary } from './utils/trip'
import { Button } from './components/Button'
import { Header } from './components/Header'
import { TripList } from './components/TripList'
import { TripDetail } from './components/TripDetail'
import { TripForm } from './components/TripForm'
import './App.css'

/**
 * A TripPlanner gyökérkomponense: központi útállapot, mentés és nézetválasztás.
 *
 * @returns A fejléc, az aktuális oldal, a lábléc és az esetleg nyitott útűrlap.
 * @remarks Az utak egyetlen forrása itt található; a gyermekkomponensek callbackekkel
 * kérnek változtatást. Így a költség, program és időjárás ugyanazon mentési úton halad.
 */
function App() {
  // Lusta inicializálás: a loadTrips az indulási állapotot adja, nem minden renderkor fut.
  const [trips, setTrips] = useState<Trip[]>(loadTrips)
  // A kezdő tömbreferencia megőrzése megkülönbözteti a betöltést a felhasználói módosítástól.
  const initialTrips = useRef(trips)
  // Csak az azonosítót tároljuk; nem másoljuk le az egész kiválasztott útobjektumot.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // null: zárt űrlap; {}: új út; { trip }: meglévő út szerkesztése.
  const [form, setForm] = useState<{ trip?: Trip } | null>(null)
  const [saveError, setSaveError] = useState('')
  const [saveAttempt, setSaveAttempt] = useState(0)
  // A részletes nézet mindig a legfrissebb állapotból kapja az út adatait.
  const selectedTrip = trips.find((trip) => trip.id === selectedId)

  // Az effekt minden új útlista vagy kézi újrapróbálás után a teljes listát menti.
  useEffect(() => {
    // Induláskor nem írjuk vissza automatikusan a sérült adat helyett kapott mintát.
    if (trips === initialTrips.current && saveAttempt === 0) return
    let active = true
    // A mikrotask elválasztja a hibaállapot frissítését az effekt szinkron lefutásától.
    Promise.resolve().then(() => {
      // Elavult vagy már leállított effekt ne mentsen és ne frissítsen hibaállapotot.
      if (!active) return
      try {
        saveTrips(trips)
        setSaveError('')
      } catch {
        // A memóriában az adatok megmaradnak, de a felhasználó értesül a mentés hibájáról.
        setSaveError(
          'A mentés nem sikerült. A változások csak ezen az oldalon maradnak meg.',
        )
      }
    })
    // Unmount vagy új effekt esetén a korábbi feladat érvénytelenné válik.
    return () => {
      active = false
    }
  }, [trips, saveAttempt])

  /**
   * Új utat illeszt be vagy a meglévő út űrlapmezőit módosítja.
   * @param trip - A validált űrlap által összeállított út.
   * @remarks A legfrissebb költség- és időjárásadatot megtartjuk; másik úti célhoz
   * a régi időjárás nem használható. A mentési effekt az új állapot után indul.
   */
  function saveTrip(trip: Trip) {
    // A napi terv az állapotfrissítőn kívül készül, így az UUID-generálás nem kerül a tiszta updaterbe.
    const itinerary = createItinerary(
      trip.startDate,
      trip.endDate,
      trips.find((item) => item.id === trip.id)?.itinerary ?? trip.itinerary,
    )
    // A map és a spread új referenciákat ad; a meglévő React-állapotot nem módosítjuk helyben.
    setTrips((current) =>
      current.some((item) => item.id === trip.id)
        ? current.map((item) =>
            item.id === trip.id
              ? {
                  ...trip,
                  expenses: item.expenses,
                  weather:
                    item.destination === trip.destination ? item.weather : null,
                  itinerary,
                }
              : item,
          )
        : [...current, trip],
    )
    // Mentés után az út részletei nyílnak meg, az űrlap pedig bezáródik.
    setSelectedId(trip.id)
    setForm(null)
  }

  /**
   * Egy meglévő út megadott mezőit cseréli, a többi adatot változatlanul hagyva.
   * @param id - A módosítandó út azonosítója.
   * @param changes - Részleges útadat, például egy új költséglista vagy időjárás.
   * @remarks Az id a spread után ismét rögzített, ezért a callback nem írhatja át az identitást.
   */
  function updateTrip(id: string, changes: Partial<Trip>) {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === id ? { ...trip, ...changes, id } : trip,
      ),
    )
  }

  /**
   * Felhasználói megerősítés után törli az utat és az összes beágyazott adatát.
   * @param id - A törlendő út azonosítója.
   * @remarks A kiválasztott út törlése visszavisz a listához; a filter új tömböt készít.
   */
  function deleteTrip(id: string) {
    if (!window.confirm('Biztosan törlöd ezt az utazást és minden adatát?'))
      return
    setTrips((current) => current.filter((trip) => trip.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <>
      {/* A fejléc csak navigációs eseményeket ad vissza, saját útállapotot nem kezel. */}
      <Header
        detailOpen={Boolean(selectedTrip)}
        onHome={() => setSelectedId(null)}
        onNew={() => setForm({})}
      />
      {/* A számláló növelése változatlan útadatokkal is új mentési effektet vált ki. */}
      {saveError && (
        <div className="save-error" role="alert">
          <AlertCircle size={20} />
          <span>{saveError}</span>
          <Button onClick={() => setSaveAttempt((value) => value + 1)}>
            <RefreshCw size={17} />
            {'Újrapróbálás'}
          </Button>
        </div>
      )}
      {/* A kiválasztás dönti el, hogy a lista vagy az út részletes nézete jelenik meg. */}
      {selectedTrip ? (
        <TripDetail
          key={selectedTrip.id}
          trip={selectedTrip}
          onUpdate={updateTrip}
          onEdit={() => setForm({ trip: selectedTrip })}
          onDelete={() => deleteTrip(selectedTrip.id)}
        />
      ) : (
        <TripList
          trips={trips}
          onSelect={setSelectedId}
          onEdit={(trip) => setForm({ trip })}
          onDelete={deleteTrip}
        />
      )}
      <footer className="footer">
        <span>TripPlanner</span>
        <span>
          {'HUF · '}
          {new Date().getFullYear()}
        </span>
      </footer>
      {/* Feltételes csatoláskor az űrlap saját mezőállapota minden megnyitásnál újraindul. */}
      {form && (
        <TripForm
          trip={form.trip}
          onSave={saveTrip}
          onClose={() => setForm(null)}
        />
      )}
    </>
  )
}

export default App

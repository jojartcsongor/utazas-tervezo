import type { Trip } from '../types/trip'

/** Saját kulcs, hogy más, azonos eredetű alkalmazások adatait ne érintsük. */
const STORAGE_KEY = 'tripplanner.trips'
/** A futásidejű ellenőrzéshez használható, megengedett kategóriaértékek. */
const expenseCategories = ['accommodation', 'food', 'activity', 'other']

/**
 * Eldönti, hogy az ismeretlen érték mezőkkel rendelkező objektum-e.
 * A null és a tömb kizárása után a TypeScript biztonságosan engedi a mezőolvasást.
 * @param value - Külső forrásból, például JSON-ból származó érték.
 * @returns Típusőrfeltétel: igaz esetén az érték rekordként vizsgálható tovább.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Kiszűri a nem szám értékeket, a NaN-t és a végtelent.
 * @param value - Ellenőrizendő mezőérték.
 * @returns Igaz, ha az érték véges szám.
 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * A dátum formátumát és tényleges naptári érvényességét is ellenőrzi.
 * @param value - Elvárt alakja YYYY-MM-DD.
 * @returns Igaz kizárólag létező, a kért formátumot követő naptári dátumnál.
 */
function isDate(value: unknown): value is string {
  // A reguláris kifejezés a szerkezetet ellenőrzi, de például február 30-át még nem.
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const timestamp = Date.parse(value)
  // A visszaalakítás és összehasonlítás észreveszi a Date által korrigált hibás napokat.
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  )
}

/**
 * Rekurzívan ellenőrzi egy út és a beágyazott listák kötelező mezőit.
 * @param value - A tárolóból betöltött, még nem megbízható érték.
 * @returns Igaz esetén az érték a tárolási séma szerint Trip-ként használható.
 * @remarks A típusállítás önmagában nem validálna; ez a típusőr tényleges ellenőrzést végez.
 */
function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) return false

  // A rövidzáras kiértékelés csak a korábbi típusellenőrzések után olvas mezőket.
  return (
    typeof value.id === 'string' &&
    typeof value.destination === 'string' &&
    // Az ISO-dátumok azonos formátumban szövegként is időrendben összehasonlíthatók.
    isDate(value.startDate) &&
    isDate(value.endDate) &&
    value.startDate <= value.endDate &&
    isFiniteNumber(value.budget) &&
    value.budget >= 0 &&
    typeof value.notes === 'string' &&
    // A null szabályos állapot: az időjárás lekérése nem előfeltétele egy útnak.
    (value.weather === null ||
      (isRecord(value.weather) &&
        isFiniteNumber(value.weather.temperature) &&
        isFiniteNumber(value.weather.weatherCode) &&
        isFiniteNumber(value.weather.windSpeed))) &&
    // Nem elég, hogy tömb: minden költség mezőinek is meg kell felelniük a sémának.
    Array.isArray(value.expenses) &&
    value.expenses.every(
      (expense: unknown) =>
        isRecord(expense) &&
        typeof expense.id === 'string' &&
        typeof expense.category === 'string' &&
        expenseCategories.includes(expense.category) &&
        isFiniteNumber(expense.amount) &&
        expense.amount >= 0 &&
        typeof expense.title === 'string',
    ) &&
    // A napi programokban a nap és a benne szereplő összes teendő is ellenőrzést kap.
    Array.isArray(value.itinerary) &&
    value.itinerary.every(
      (day: unknown) =>
        isRecord(day) &&
        typeof day.id === 'string' &&
        isFiniteNumber(day.dayNumber) &&
        Number.isInteger(day.dayNumber) &&
        day.dayNumber >= 1 &&
        isDate(day.date) &&
        Array.isArray(day.activities) &&
        day.activities.every(
          (activity: unknown) =>
            isRecord(activity) &&
            typeof activity.id === 'string' &&
            typeof activity.title === 'string' &&
            typeof activity.completed === 'boolean',
        ),
    )
  )
}

/**
 * Friss mintaútlistát készít az első indításhoz és a hibás betöltés tartalékához.
 *
 * @returns Egy budapesti mintaút, forintban megadott kerettel.
 * @remarks Minden hívás új objektumokat és tömböket készít, így nincs közösen módosított mintaállapot.
 */
export function getDefaultTrips(): Trip[] {
  return [
    {
      id: 'sample-budapest',
      destination: 'Budapest',
      startDate: '2027-06-01',
      endDate: '2027-06-03',
      budget: 120000,
      notes: '',
      weather: null,
      expenses: [],
      itinerary: [],
    },
  ]
}

/**
 * JSON-formátumban elmenti a teljes útlistát a böngésző LocalStorage-tárolójába.
 *
 * @param trips - A mentendő utak; az üres tömb is érvényes és megőrzendő adat.
 * @throws Hibás adatszerkezet, letiltott tároló vagy elfogyott tárhely esetén.
 * @remarks A hibát nem nyeljük el, hogy az App látható figyelmeztetést adhasson.
 */
export function saveTrips(trips: Trip[]): void {
  if (!Array.isArray(trips) || !trips.every(isTrip)) {
    throw new Error('Invalid trip data.')
  }
  // A LocalStorage csak sztringet tárol; a teljes, ellenőrzött lista JSON-ná alakul.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

/**
 * Visszaolvassa és ellenőrzi az utakat, első látogatáskor pedig mentett mintát ad.
 *
 * @returns Érvényes mentett lista, vagy betöltési hiba esetén egy új mintaútlista.
 * @remarks A hiányzó kulcs és a mentett üres tömb különbözik: az utóbbit nem töltjük fel újra.
 * A sérült tartalmat ez a függvény nem írja felül, így az eredeti adat helyreállítható marad.
 */
export function loadTrips(): Trip[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    // Csak a hiányzó kulcs jelent első indítást; a '[]' tudatosan üres lista.
    if (stored === null) {
      const trips = getDefaultTrips()
      saveTrips(trips)
      return trips
    }

    // A JSON eredménye unknown: előbb ellenőrizzük, és csak utána kezeljük útlistaként.
    const parsed: unknown = JSON.parse(stored)
    if (Array.isArray(parsed) && parsed.every(isTrip)) return parsed
  } catch {
    // A hibás JSON vagy letiltott tároló nem akadályozza meg a felület indulását.
    return getDefaultTrips()
  }

  // Szintaktikailag jó JSON, de hibás adatmodell esetén is új minta a tartalék.
  return getDefaultTrips()
}

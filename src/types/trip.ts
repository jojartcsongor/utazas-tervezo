/**
 * A négy támogatott költségkategória belső azonosítója.
 * A sztringliterál-unió fordításkor kizárja az elgépeléseket; a magyar feliratokat
 * a categoryLabels tartalmazza, ezért a tárolt értékek nem függnek a felület nyelvétől.
 */
export type ExpenseCategory = 'accommodation' | 'food' | 'activity' | 'other'

/**
 * Az alkalmazás saját, API-választól független időjárásmodellje.
 * A weatherService az Open-Meteo mezőneveit erre az egyszerű szerkezetre alakítja.
 */
export interface WeatherData {
  /** Aktuális levegő-hőmérséklet Celsius-fokban. */
  temperature: number
  /** WMO időjáráskód, amelyből a widget olvasható állapotleírást készít. */
  weatherCode: number
  /** Szélsebesség kilométer/óra mértékegységben. */
  windSpeed: number
}

/** Egy út egyetlen kiadása; az összesítés kategória és összeg alapján történik. */
export interface Expense {
  /** Egyedi azonosító a React listakulcsaihoz és a célzott törléshez. */
  id: string
  /** A kategóriasávokban és a listában használt belső csoportazonosító. */
  category: ExpenseCategory
  /** Nem negatív összeg, az út keretével azonos pénznemben, jelenleg forintban. */
  amount: number
  /** A kiadás rövid, felhasználó által megadott megnevezése. */
  title: string
}

/** Egy napi teendő, amelynek elvégzése külön jelölőnégyzettel követhető. */
export interface Activity {
  /** Egyedi azonosító a teendő módosításához és törléséhez. */
  id: string
  /** A tervezett program vagy teendő szövege. */
  title: string
  /** Igaz, ha a felhasználó késznek jelölte a teendőt. */
  completed: boolean
}

/**
 * Egy naptári naphoz tartozó programok.
 * A dátum megmarad szerkesztéskor, a dayNumber viszont az út új kezdetéhez igazodhat.
 */
export interface ItineraryDay {
  /** A napi kártya stabil, a sorszámtól független azonosítója. */
  id: string
  /** Az úton belüli sorszám; az első nap értéke 1. */
  dayNumber: number
  /** Naptári dátum YYYY-MM-DD formátumban, időpont és időzóna nélkül. */
  date: string
  /** A teendők megjelenítési sorrendje; program nélkül üres tömb. */
  activities: Activity[]
}

/**
 * Az alkalmazás központi adatmodellje: egy út minden kapcsolódó adatával.
 *
 * @remarks
 * A dátumok sztringek, ezért a teljes objektum közvetlenül JSON-ba menthető.
 * Ezek fordításidejű típusok; a LocalStorage-ból visszaolvasott adatokat a
 * storageService futásidőben is ellenőrzi.
 */
export interface Trip {
  /** Az út egyedi azonosítója; a kiválasztás és minden frissítés ezt használja. */
  id: string
  /** Úti cél; az időjárás-szolgáltatás városnévként keresi meg. */
  destination: string
  /** Indulási dátum YYYY-MM-DD formátumban; a programterv első napja is ide esik. */
  startDate: string
  /** Záródátum YYYY-MM-DD formátumban; ez a nap is része az útnak. */
  endDate: string
  /** Nem negatív költségkeret az alkalmazás közös pénznemében, forintban. */
  budget: number
  /** Szabad szöveges jegyzet; hiányzó jegyzet esetén üres sztring. */
  notes: string
  /** A legutóbb lekért időjárás, vagy null, ha még nincs használható adat. */
  weather: WeatherData | null
  /** Az út kiadásai; az üres tömb azt jelenti, hogy még nincs rögzített költség. */
  expenses: Expense[]
  /** Napi programterv; a mintautaknál létrehozás előtt üres tömb is lehet. */
  itinerary: ItineraryDay[]
}

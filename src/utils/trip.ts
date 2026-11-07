import type { ExpenseCategory, ItineraryDay } from '../types/trip'

/**
 * A belső költségkategória-azonosítók magyar feliratai.
 * A Record típus biztosítja, hogy minden ExpenseCategory-értékhez tartozzon címke.
 */
export const categoryLabels: Record<ExpenseCategory, string> = {
  accommodation: 'Szállás',
  food: 'Étkezés',
  activity: 'Program',
  other: 'Egyéb',
}

/**
 * Magyar pénzformátumban jeleníti meg az összeget, forint pénznemmel.
 * @param amount - Formázandó összeg; a formázás nem módosítja a tárolt számértéket.
 * @returns Olvasható pénzösszeg, magyar ezreselválasztással, tizedesjegyek nélkül.
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Rövid magyar hónap- és napformátumra alakít egy ISO-dátumot.
 * @param date - Érvényes naptári dátum YYYY-MM-DD formátumban.
 * @returns A felületen használható rövid dátum, például „jún. 1.”.
 * @remarks Az UTC-beállítás megelőzi, hogy a helyi időzóna az előző napra tolja a megjelenítést.
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('hu-HU', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}

/**
 * Mindkét határnapot tartalmazó napi tervet állít elő, megtartva a meglévő programokat.
 * @param startDate - Az út első napja ISO-dátumként.
 * @param endDate - Az út utolsó napja ISO-dátumként.
 * @param existing - A korábbi terv, amelyből dátum szerint átvesszük a napok adatait.
 * @returns Új napi lista újraszámolt sorszámokkal; új napoknál üres teendőlistával.
 * @throws Fordított, nem értelmezhető vagy 366 napnál hosszabb dátumtartomány esetén.
 * @remarks Az azonos dátumú napok azonosítója és teendőlistája megmarad; a kieső napok kimaradnak.
 */
export function createItinerary(
  startDate: string,
  endDate: string,
  existing: ItineraryDay[] = [],
): ItineraryDay[] {
  const start = Date.parse(startDate)
  // Egy nap 86 400 000 ezredmásodperc; a +1 miatt a zárónap is szerepel a tervben.
  const length = (Date.parse(endDate) - start) / 86400000 + 1
  if (!Number.isInteger(length) || length < 1 || length > 366) {
    throw new Error('Az utazás hossza 1–366 nap lehet.')
  }
  return Array.from({ length }, (_, index) => {
    // ISO-formátumból csak a naptári rész kell, időpont nélkül.
    const date = new Date(start + index * 86400000).toISOString().slice(0, 10)
    // Nem sorszám szerint keresünk: egy korábbi kezdődátum megváltoztathatja a sorszámot.
    const previous = existing.find((day) => day.date === date)
    // Az UUID kizárólag új napnál keletkezik; a React-kulcsok a megmaradó napoknál stabilak.
    return {
      id: previous?.id ?? crypto.randomUUID(),
      dayNumber: index + 1,
      date,
      activities: previous?.activities ?? [],
    }
  })
}

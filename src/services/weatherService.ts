import type { WeatherData } from '../types/trip'

/**
 * Az API ismeretlen válaszáról eldönti, hogy mezőkkel vizsgálható objektum-e.
 * @param value - JSON-ból érkező, még nem ellenőrzött érték.
 * @returns Igaz esetén biztonságosan olvashatók és ellenőrizhetők a rekord mezői.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Kizárja a hiányzó, sztringként érkező és nem véges mérési értékeket.
 * @param value - Egy koordináta vagy időjárási mező értéke.
 * @returns Igaz, ha a további számításokhoz véges számot kaptunk.
 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Közös HTTP-lekérő a helykereséshez és az előrejelzési végponthoz.
 * @param url - Strukturált URL, amely tartalmazza a kérés paramétereit is.
 * @returns A JSON-válasz; a hívó ellenőrzi a konkrét szerkezetét.
 * @throws Hálózati hiba, sikertelen HTTP-státusz vagy hibás JSON esetén.
 */
async function fetchJson(url: URL): Promise<unknown> {
  const response = await fetch(url)
  // A fetch a 4xx/5xx válaszokat nem tekinti kivételnek, ezért külön vizsgáljuk az ok mezőt.
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed (HTTP ${response.status}).`)
  }
  return response.json()
}

/**
 * Városnévből koordinátát keres, majd aktuális időjárást kér az Open-Meteótól.
 *
 * @param city - A keresendő város nem üres neve; a szélső szóközöket eltávolítjuk.
 * @returns Az alkalmazás WeatherData modellje Celsius-fokkal, WMO-kóddal és km/h-val.
 * @throws Üres vagy ismeretlen város, hálózati/HTTP-hiba, illetve hibás API-adat esetén.
 * @remarks Nem szükséges API-kulcs. Azonos nevű helyeknél a geokódoló első találatát használjuk.
 */
export async function getWeather(city: string): Promise<WeatherData> {
  // Az üres név már helyben hibát ad, felesleges hálózati kérés nélkül.
  const name = city.trim()
  if (!name) throw new Error('A city name is required.')

  // Első kérés: a városból földrajzi szélességet és hosszúságot kapunk.
  const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
  // A URLSearchParams megfelelően kódolja az ékezeteket és a szóközöket is.
  geocodingUrl.search = new URLSearchParams({
    name,
    count: '1',
    format: 'json',
  }).toString()
  const geocoding = await fetchJson(geocodingUrl)
  if (!isRecord(geocoding)) throw new Error('Invalid geocoding response.')

  // A szolgáltatás találat nélkül el is hagyhatja a results mezőt.
  if (
    geocoding.results === undefined ||
    (Array.isArray(geocoding.results) && geocoding.results.length === 0)
  ) {
    throw new Error(`City not found: ${name}.`)
  }
  if (!Array.isArray(geocoding.results))
    throw new Error('Invalid geocoding response.')

  const location: unknown = geocoding.results[0]
  // A koordináták a számellenőrzés mellett földrajzi tartományellenőrzést is kapnak.
  if (
    !isRecord(location) ||
    !isFiniteNumber(location.latitude) ||
    !isFiniteNumber(location.longitude) ||
    Math.abs(location.latitude) > 90 ||
    Math.abs(location.longitude) > 180
  ) {
    throw new Error('Invalid coordinates in geocoding response.')
  }

  // Második kérés: csak a widgethez szükséges aktuális mérési mezőket kérjük le.
  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast')
  weatherUrl.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,weather_code,wind_speed_10m',
    // A mértékegységeket kifejezetten rögzítjük, hogy megfeleljenek a saját modellnek.
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  }).toString()

  const weather = await fetchJson(weatherUrl)
  if (!isRecord(weather) || !isRecord(weather.current)) {
    throw new Error('Invalid weather response.')
  }

  // A current objektum létezése még nem garantálja a benne található mezők típusát.
  const current = weather.current
  if (
    !isFiniteNumber(current.temperature_2m) ||
    !isFiniteNumber(current.weather_code) ||
    !isFiniteNumber(current.wind_speed_10m)
  ) {
    throw new Error('Missing or invalid current weather values.')
  }

  // Az API-specifikus mezőnevek nem jutnak tovább a komponensekbe.
  return {
    temperature: current.temperature_2m,
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
  }
}

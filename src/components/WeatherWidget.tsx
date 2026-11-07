import { useEffect, useEffectEvent, useState } from 'react'
import { CloudSun, RefreshCw, Thermometer, Wind } from 'lucide-react'
import type { WeatherData } from '../types/trip'
import { getWeather } from '../services/weatherService'
import { Button } from './Button'

/** A helyi lekéréshez szükséges név és a központilag tárolt időjárás kapcsolata. */
interface WeatherWidgetProps {
  /** A geokódoló szolgáltatásban megkeresendő város. */
  city: string
  /** Korábban mentett időjárás; null esetén automatikus lekérés indul. */
  weather: WeatherData | null
  /** A sikeres eredményt az út központi állapotába továbbító callback. */
  onWeather: (weather: WeatherData) => void
}

/**
 * Rövid magyar feliratot választ az Open-Meteo WMO-kódjához.
 * @param code - A szolgáltatástól kapott időjáráskód.
 * @returns A mérések melletti összefoglaló állapotleírás.
 * @remarks A szabványos kódok csoportjait tartományonként, egyszerűsítve jelenítjük meg.
 */
function describeWeather(code: number): string {
  if (code === 0) return 'Derült'
  if (code <= 3) return 'Felhős'
  if (code <= 48) return 'Ködös'
  if (code <= 67) return 'Esős'
  if (code <= 77) return 'Havazás'
  if (code <= 82) return 'Záporok'
  if (code <= 86) return 'Hózápor'
  return 'Zivatar'
}

/**
 * Aktuális időjárást jelenít meg, hiányzó adatnál pedig lekéri azt a szolgáltatástól.
 * @returns Időjárási mérések, betöltési/hibaállapot, frissítőgomb és forrásmegjelölés.
 * @remarks A mérés az út adata, míg a betöltés állapota helyi UI-állapot.
 * A szülő az útazonosító és város szerinti key-jel újraindítja a widgetet városváltáskor.
 */
export function WeatherWidget({
  city,
  weather,
  onWeather,
}: WeatherWidgetProps) {
  // A számláló ugyanahhoz a városhoz is új effektet indít kézi frissítéskor.
  const [refresh, setRefresh] = useState(0)
  const [status, setStatus] = useState(weather ? 'idle' : 'loading')
  const [error, setError] = useState('')
  // Az EffectEvent mindig a legfrissebb callbacket olvassa, annak referencia-változása nélkül.
  const receiveWeather = useEffectEvent((data: WeatherData) => onWeather(data))
  // Az effekt indulásakor a legfrissebb cache-állapot alapján döntünk a lekérésről.
  const shouldFetch = useEffectEvent(() => !weather || refresh > 0)

  useEffect(() => {
    // A korábban tárolt mérés megnyitáskor megjeleníthető, nincs kötelező ismételt kérés.
    if (!shouldFetch()) return
    let active = true
    getWeather(city)
      .then((data) => {
        // Későn érkező válasz nem írhatja felül egy már leállított widget állapotát.
        if (!active) return
        // A szülő az útba menti a mérést, így a LocalStorage-mentés is automatikusan követi.
        receiveWeather(data)
        setStatus('idle')
        setError('')
      })
      .catch(() => {
        if (!active) return
        setStatus('error')
        setError('Az időjárás nem érhető el. Próbáld újra.')
      })
    // Ez a jelző nem szakítja meg a hálózatot, csak figyelmen kívül hagyja az elavult eredményt.
    return () => {
      active = false
    }
  }, [city, refresh])

  return (
    <section className="weather-widget" aria-label={'Aktuális időjárás'}>
      {/* A frissítés helyi állapotot állít; a számláló változása indítja el a hálózati effektet. */}
      <div className="section-heading">
        <h2>
          <CloudSun size={22} />
          {'Most, itt'}
        </h2>
        <Button
          variant="icon"
          disabled={status === 'loading'}
          title={'Időjárás frissítése'}
          aria-label={'Időjárás frissítése'}
          onClick={() => {
            setStatus('loading')
            setError('')
            setRefresh((value) => value + 1)
          }}
        >
          <RefreshCw
            size={18}
            className={status === 'loading' ? 'spinning' : ''}
          />
        </Button>
      </div>
      {/* A meglévő mérés frissítés közben is látszik; nincs szükség üres widgetre. */}
      {weather && (
        <div className="weather-values">
          <strong>
            <Thermometer size={25} />
            {Math.round(weather.temperature)}
            {'°C'}
          </strong>
          <div>
            <span>{describeWeather(weather.weatherCode)}</span>
            <span className="muted">
              <Wind size={15} />
              {weather.windSpeed} km/h
            </span>
          </div>
        </div>
      )}
      {/* A status és alert szerepek segítik a képernyőolvasót az állapotváltozás követésében. */}
      {status === 'loading' && (
        <p className="muted small" role="status">
          {'Időjárás betöltése...'}
        </p>
      )}
      {error && (
        <p className="error small" role="alert">
          {error}
        </p>
      )}
      <a
        className="weather-source"
        href="https://open-meteo.com/"
        target="_blank"
        rel="noreferrer"
      >
        Open-Meteo
      </a>
    </section>
  )
}

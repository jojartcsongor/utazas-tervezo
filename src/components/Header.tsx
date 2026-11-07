import { ArrowLeft, MapPin, Plus } from 'lucide-react'
import { Button } from './Button'

/** A fejléc nézetjelzője és a szülőben kezelt navigációs események. */
interface HeaderProps {
  /** A visszalépési gomb csak a részletes oldalon szükséges. */
  detailOpen: boolean
  /** Az útlistát megnyitó callback. */
  onHome: () => void
  /** Az új út űrlapját megnyitó callback. */
  onNew: () => void
}

/**
 * Megjeleníti az alkalmazás nevét és az aktuális nézethez tartozó navigációt.
 * @returns Fejléc szemantikus nav elemmel és parancsgombokkal.
 * @remarks Nem módosít útadatot: az onHome és onNew eseményt az App dolgozza fel.
 */
export function Header({ detailOpen, onHome, onNew }: HeaderProps) {
  return (
    <header className="header">
      {/* A preventDefault megakadályozza a hash-navigációt; a nézetet az App váltja. */}
      <a
        className="brand"
        href="#"
        onClick={(event) => {
          event.preventDefault()
          onHome()
        }}
      >
        <MapPin size={25} />
        TripPlanner<span className="brand-dot">.</span>
      </a>
      <nav aria-label={'Fő navigáció'}>
        {/* A listán nincs szükség önmagába visszavezető gombra. */}
        {detailOpen && (
          <Button onClick={onHome}>
            <ArrowLeft size={18} />
            <span>{'Utazások'}</span>
          </Button>
        )}
        <Button variant="primary" onClick={onNew}>
          <Plus size={18} />
          {'Új utazás'}
        </Button>
      </nav>
    </header>
  )
}

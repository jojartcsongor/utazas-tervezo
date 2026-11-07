import type { ButtonHTMLAttributes } from 'react'

/** A natív gomb attribútumai és az alkalmazás saját megjelenési változata. */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Elsődleges művelet, általános gomb, veszélyes művelet vagy ikonvezérlő. */
  variant?: 'primary' | 'secondary' | 'danger' | 'icon'
}

/**
 * Egységes megjelenésű, újrafelhasználható kezelőgomb.
 * @returns Natív button elem az átadott felirattal, ikonnal és eseménykezelőkkel.
 * @remarks A props továbbítása megtartja az aria-label, disabled és onClick attribútumokat.
 * Az alapértelmezett button típus nem küldi el véletlenül a környező űrlapot.
 */
export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  // A saját CSS-osztályokhoz hozzáadjuk a hívó egyedi osztályát, a többi attribútumot továbbengedjük.
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      {...props}
    />
  )
}

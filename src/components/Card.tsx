import type { HTMLAttributes } from 'react'

/**
 * Közös vizuális keret az önálló, ismétlődő út- és napkártyákhoz.
 * @returns Szemantikus article elem a hívótól kapott tartalommal és attribútumokkal.
 * @remarks Nem kezel adatot vagy állapotot; a className kiegészítésével több kártyatípus használja.
 */
export function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLElement>) {
  // A children is a maradék props része, ezért ugyanúgy jut az article elemre, mint a többi attribútum.
  return <article className={`card ${className}`} {...props} />
}

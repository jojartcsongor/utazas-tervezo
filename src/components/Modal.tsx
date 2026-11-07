import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

/** A párbeszédablak címét, tartalmát és bezárási eseményét leíró szerződés. */
interface ModalProps {
  /** Látható cím, amely az akadálymentes elnevezést is biztosítja. */
  title: string
  /** A szülő eltávolítja a modalt a komponensfából. */
  onClose: () => void
  /** Tetszőleges React-tartalom, itt jellemzően az útűrlap. */
  children: ReactNode
}

/**
 * Natív HTML dialog elemmel megvalósított modális párbeszédablak.
 * @returns Címkézett modal, bezárógombbal és a kapott tartalommal.
 * @remarks A showModal biztosítja a háttér inaktivitását és a billentyűzetes fókuszcsapdát.
 * Az Escape cancel eseménye ugyanazt a bezárási callbacket hívja, mint az ikon.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  // A ref közvetlenül a DOM-elemet őrzi, de módosítása nem indít React-renderelést.
  const dialog = useRef<HTMLDialogElement>(null)

  // Csatolás után nyitható a natív modal, mert ekkor már létezik a DOM-eleme.
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    // A bezárógomb helyett az első mező kap fókuszt, így rögtön el lehet kezdeni a kitöltést.
    element?.querySelector<HTMLElement>('input, select, textarea')?.focus()
    // A háttér görgetését csak a modal élettartamára tiltjuk le.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      // A takarítás StrictMode újracsatoláskor is visszaállítja a korábbi böngészőállapotot.
      element?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    // Az aria-labelledby a látható címet kapcsolja a párbeszédablak elnevezéséhez.
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={onClose}
    >
      <div className="section-heading">
        <h2 id="modal-title">{title}</h2>
        <Button
          variant="icon"
          aria-label={'Bezárás'}
          title={'Bezárás'}
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  )
}

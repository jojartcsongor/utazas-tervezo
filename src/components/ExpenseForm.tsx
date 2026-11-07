import { useState, type SubmitEvent } from 'react'
import { Plus } from 'lucide-react'
import type { Expense, ExpenseCategory } from '../types/trip'
import { categoryLabels } from '../utils/trip'
import { Button } from './Button'

/**
 * Kontrollált űrlap egy megnevezett, kategóriába sorolt kiadás rögzítéséhez.
 * @returns Beviteli mezők, kategóriaválasztó, hozzáadógomb és helyi hibaüzenet.
 * @remarks Az onAdd csak az új költséget adja át; a teljes listát a szülő állítja össze.
 * Az összeg forintban értendő, a kategória pedig belső azonosítóként tárolódik.
 */
export function ExpenseForm({ onAdd }: { onAdd: (expense: Expense) => void }) {
  const [title, setTitle] = useState('')
  // A gépelhető összeg sztring; csak sikeres ellenőrzés után alakítjuk számmá.
  const [amount, setAmount] = useState('')
  // A szűk uniótípus csak a négy támogatott kategória használatát engedi.
  const [category, setCategory] = useState<ExpenseCategory>('accommodation')
  const [error, setError] = useState('')

  /**
   * Validálja a költséget, új azonosítóval továbbítja, majd előkészíti a következő bevitelt.
   * @param event - A form beküldési eseménye; nem történik teljes oldalfrissítés.
   * @remarks Az üres összeg nem azonos a szabályos nullával; a hibás mezők megmaradnak javításhoz.
   */
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    // A trim kizárja a csak szóközös nevet; a Number.isFinite a nem véges összegeket is szűri.
    if (
      !title.trim() ||
      !amount ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) < 0
    ) {
      setError('Adj meg megnevezést és érvényes összeget.')
      return
    }
    // A stabil UUID a listázás és később a célzott törlés alapja.
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: Number(amount),
      category,
    })
    // A kategóriát megtartjuk a következő költséghez, a szöveget és az összeget kiürítjük.
    setTitle('')
    setAmount('')
    setError('')
  }

  return (
    <form className="expense-form" onSubmit={submit}>
      <label>
        {'Megnevezés'}
        <input
          required
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      {/* A select opciói a közös kategóriatérképből készülnek; az as csak típusállítás, nem konverzió. */}
      <label>
        {'Kategória'}
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as ExpenseCategory)
          }
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        {'Összeg (Ft)'}
        <input
          type="number"
          required
          min="0"
          max="1000000000000"
          step="1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <Button type="submit" variant="primary">
        <Plus size={18} />
        {'Hozzáadás'}
      </Button>
      {/* A hiba az űrlap része, így nem vész el a már megadott bevitel. */}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

import { Trash2, Wallet } from 'lucide-react'
import type { Expense } from '../types/trip'
import { categoryLabels, formatMoney } from '../utils/trip'
import { Button } from './Button'
import { ExpenseForm } from './ExpenseForm'
import { StatsOverview } from './StatsOverview'

/** A költségkezelőnek átadott pénzügyi adatok és a lista-visszajelzés. */
interface ExpenseTrackerProps {
  /** Az út aktuális költséglistája. */
  expenses: Expense[]
  /** A kiadásokkal összevetett teljes költségkeret. */
  budget: number
  /** Új teljes költséglistát továbbít a szülő komponensnek. */
  onChange: (expenses: Expense[]) => void
}

/**
 * Egy út költségeinek hozzáadását, törlését és pénzügyi áttekintését fogja össze.
 * @returns Kategóriasávok, költségűrlap és kiadáslista vagy üres állapot.
 * @remarks A lista a szülőtől érkezik; a komponens csak új tömböt készít és azt adja vissza.
 */
export function ExpenseTracker({
  expenses,
  budget,
  onChange,
}: ExpenseTrackerProps) {
  return (
    <section className="detail-section" aria-labelledby="expenses-heading">
      <div className="section-heading">
        <h2 id="expenses-heading">
          <Wallet size={22} />
          {'Költségek'}
        </h2>
        <span className="muted">
          {'Keret: '}
          {formatMoney(budget)}
        </span>
      </div>
      <StatsOverview expenses={expenses} budget={budget} />
      {/* A spread új tömböt ad; nem használunk push-t a propsban kapott állapoton. */}
      <ExpenseForm onAdd={(expense) => onChange([...expenses, expense])} />
      {/* A map megjelenít, a törlő callback filterrel kizárja a választott id-jű költséget. */}
      {expenses.length ? (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <span
                className={`category-marker category-${expense.category}`}
              />
              <div className="expense-description">
                <strong>{expense.title}</strong>
                <span className="muted small">
                  {categoryLabels[expense.category]}
                </span>
              </div>
              <strong className="expense-amount">
                {formatMoney(expense.amount)}
              </strong>
              <Button
                variant="icon"
                title={'Költség törlése'}
                aria-label={`${expense.title}: törlés`}
                onClick={() =>
                  onChange(expenses.filter((item) => item.id !== expense.id))
                }
              >
                <Trash2 size={17} />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted empty-inline">{'Még nincs rögzített kiadás.'}</p>
      )}
    </section>
  )
}

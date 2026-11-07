import type { Expense, ExpenseCategory } from '../types/trip'
import { categoryLabels, formatMoney } from '../utils/trip'

/**
 * Kiszámítja a teljes kiadást, a maradék keretet és a kategóriák arányait.
 * @returns Pénzügyi összegzés és akadálymentesen címkézett progress sávok.
 * @remarks Kizárólag származtatott adatokat jelenít meg, saját state vagy mellékhatás nélkül.
 * A kategóriasávok az összes elköltött pénzhez, nem a tervezett kerethez viszonyítanak.
 */
export function StatsOverview({
  expenses,
  budget,
}: {
  expenses: Expense[]
  budget: number
}) {
  // A 0 kezdőérték miatt az üres lista összege is szabályosan nulla.
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  return (
    <div className="stats-overview">
      <div>
        {/* A Math.abs pozitív összeget mutat; a felirat jelzi, hogy maradék vagy túllépés. */}
        <div className="budget-summary">
          <div>
            <span>{'Elköltve'}</span>
            <strong>{formatMoney(total)}</strong>
          </div>
          <div>
            <span>{total > budget ? 'Túllépés' : 'Fennmaradó keret'}</span>
            <strong className={total > budget ? 'error' : ''}>
              {formatMoney(Math.abs(budget - total))}
            </strong>
          </div>
        </div>
        {total > budget && (
          <p className="error" role="status">
            {'A kiadások meghaladják a keretet.'}
          </p>
        )}
      </div>
      {/* A Record kulcsai a négy ismert kategóriát adják, ugyanabban a sorrendben a teljes felületen. */}
      <div className="category-stats">
        {(Object.keys(categoryLabels) as ExpenseCategory[]).map((category) => {
          // Előbb kategóriára szűrünk, majd összeadjuk az ide tartozó költségeket.
          const amount = expenses
            .filter((expense) => expense.category === category)
            .reduce((sum, expense) => sum + expense.amount, 0)
          // Nulla összkiadásnál is pozitív max szükséges; a value=0 ettől még üres sávot mutat.
          return (
            <div
              key={category}
              className={`category-stat category-${category}`}
            >
              <div>
                <span>{categoryLabels[category]}</span>
                <strong>{formatMoney(amount)}</strong>
              </div>
              <progress
                value={amount}
                max={total || 1}
                aria-label={`${categoryLabels[category]}: ${formatMoney(amount)}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

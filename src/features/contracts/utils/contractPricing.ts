export const VAT_RATE = 0.05

export type RentalPeriod = 'daily' | 'weekly' | 'monthly'

export const toNumber = (value: string): number => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const money = (value: number): string => (Math.round(value * 100) / 100).toFixed(2)

/** How many billing units (days / weeks / months) a rental of `days` covers. */
export function periodUnits(days: number, period: RentalPeriod): number {
  if (days <= 0) return 0
  if (period === 'weekly') return Math.ceil(days / 7)
  if (period === 'monthly') return Math.ceil(days / 30)
  return days
}

type PricingInput = {
  rate: number
  units: number
  /** Manual amount typed by staff. Empty string means "use rate x units". */
  amountOverride: string
  addVat: boolean
  amountContainsVat: boolean
}

export function computePricing({ rate, units, amountOverride, addVat, amountContainsVat }: PricingInput) {
  const baseRental = rate * units
  const override = (amountOverride ?? '').trim()
  const amount = override === '' ? baseRental : toNumber(override)

  if (!addVat) return { baseRental, amount, net: amount, vat: 0, total: amount }
  if (amountContainsVat) {
    const net = amount / (1 + VAT_RATE)
    return { baseRental, amount, net, vat: amount - net, total: amount }
  }
  const vat = amount * VAT_RATE
  return { baseRental, amount, net: amount, vat, total: amount + vat }
}
export const getYYYYMM = (date: string): string => {
  const dateWithoutDay = date.split('-')
  dateWithoutDay.pop()
  return dateWithoutDay.join('-')
}

export const getUTCDay = () => new Date().getUTCDate()

export const getCurrentMonthDateRange = (date?: Date) => {
  const currentDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date()
  // Get the first day of the current month in UTC
  const firstDayOfMonthUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1))

  // Get the last day of the current month in UTC.  We find the first day of the *next* month, then subtract one day.
  const firstDayOfNextMonthUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1))
  const lastDayOfMonthUTC = new Date(firstDayOfNextMonthUTC.getTime() - 1) // Subtract 1 millisecond

  // Format the start date as "YYYY-MM-DD" in UTC
  const startYearFormatted = firstDayOfMonthUTC.getUTCFullYear()
  const startMonthFormatted = String(firstDayOfMonthUTC.getUTCMonth() + 1).padStart(2, '0')
  const startDayFormatted = String(firstDayOfMonthUTC.getUTCDate()).padStart(2, '0')

  // Format the end date as "YYYY-MM-DD" in UTC
  const endYearFormatted = lastDayOfMonthUTC.getUTCFullYear()
  const endMonthFormatted = String(lastDayOfMonthUTC.getUTCMonth() + 1).padStart(2, '0')
  const endDayFormatted = String(lastDayOfMonthUTC.getUTCDate()).padStart(2, '0')

  return {
    start: `${startYearFormatted}-${startMonthFormatted}-${startDayFormatted}`,
    end: `${endYearFormatted}-${endMonthFormatted}-${endDayFormatted}`,
  }
}

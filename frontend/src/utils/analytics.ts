const percentValuesList = [
  'transparencyRate',
  'feedForwardHandlingRate',
  'delegationRate',
  'closingRatePerSurvey',
  'participationRate',
  'percentageOfFeedforwardsThatWereMarkedDiscussed',
]
export const isKpiPercentValue = (value: string) => {
  return percentValuesList.includes(value)
}

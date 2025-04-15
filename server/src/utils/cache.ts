import NodeCache from 'node-cache'

// Initialize the cache with a TTL (time-to-live) of 6 hour
export const cache = new NodeCache({ stdTTL: 3600 * 6 })

export const cacheKeySurveyMetrics = `surveyMetrics`
export const cacheKeyCompanies = `companies`

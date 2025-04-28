import NodeCache from 'node-cache'

// Initialize the cache with a TTL (time-to-live) of 6 hour
export const cache = new NodeCache({ stdTTL: 3600 * 6 })

export const cacheKeySurveyMetrics = `surveyMetrics`
export const cacheKeyCompanies = `companies`

const visitorCacheKeySet = new Set<string>()
export const getCacheKeyVisitors = (YYYYMM: string): string => {
  const cacheKey = `visitors-${YYYYMM}`
  visitorCacheKeySet.add(cacheKey)
  return cacheKey
}
export const clearVisitorsCacheKeys = () => {
  visitorCacheKeySet.forEach(key => cache.del(key))
  visitorCacheKeySet.clear()
}

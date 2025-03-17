export interface PiwikAuthResult {
  data: {
    access_token: string
    expires_in: number
    token_type: string
  }
}

export interface PiwikQueryResult {
  data: {
    data: Array<string[] | number[]>
    meta: {
      columns: string[]
      scope: string
      blended_datasets: []
      count: number
    }
  }
}

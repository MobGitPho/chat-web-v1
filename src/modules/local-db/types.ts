export interface DataConfig {
  path: string
  indexedParam?: string
  reverseData?: boolean
  callOnInit?: boolean
}

export interface ContextState {
  data: Record<string, any | { [key: string | number]: any }>
  displayLoader: Record<string, boolean>
  isFetchingData: Record<string, boolean>
}

export enum DisplayLoader {
  DISABLED = 0,
  ENABLED,
  AUTO,
}

export interface FetchOptions {
  displayLoader?: DisplayLoader
  params?: Record<string, any>
  indexedParam?: string
  reverseData?: boolean
  enableLog?: boolean
}

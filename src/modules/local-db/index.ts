import { replaceStringParts } from '@/utils/functions'

import { FetchOptions } from './types'

/**
 * Initializes the local database data by fetching the necessary data for each entity.
 *
 * @return {Promise<void>} This function does not return anything.
 */
export const initLocalDbData = async (): Promise<void> => {
  // Use import.meta.glob to dynamically import all modules matching the specified pattern
  const modules = import.meta.glob('./contexts/*.ts', { eager: true })
  for (const path in modules) {
    // Retrieve the module from the modules object
    const module: any = modules[path]
    let useStore: any, config: any
    for (const key in module) {
      // Identify the store and config objects based on their naming convention
      if (key.endsWith('LocalDb')) useStore = module[key]
      if (key.endsWith('Config')) config = module[key]
    }
    // If both useStore and config are found in the module, proceed with initialization
    if (useStore && config) {
      // Create an instance of the store
      const store = useStore()

      // Init the displayLoader to false by default for all keys
      if (
        typeof store.displayLoader === 'object' &&
        store.displayLoader !== null
      ) {
        Object.keys(store.displayLoader).forEach((key: any) => {
          store.displayLoader[key] = false
        })
      }

      // Init the isFetchingData to false by default for all keys
      if (
        typeof store.isFetchingData === 'object' &&
        store.isFetchingData !== null
      ) {
        Object.keys(store.isFetchingData).forEach((key: any) => {
          store.isFetchingData[key] = false
        })
      }

      // Iterate over the keys in the config object
      Object.keys(config).forEach((key: any) => {
        // Call the fetchData method on the store if callOnInit is true in the config
        // @ts-ignore
        if (config[key]?.callOnInit) store.fetchData(key)
      })
    }
  }
}

/**
 * Fetches data from the server and updates the store.
 *
 * @param {any} store - the store object
 * @param {any} key - the key for the data
 * @param {string} path - the path to fetch data from
 * @param {FetchOptions} options - optional fetch options
 * @return {Promise<void>} - a promise that resolves when the data is fetched
 */
export const fetchLocalDbData = async (
  store: any,
  key: any,
  path: string,
  options: FetchOptions = {}
): Promise<void> => {
  // Destructure the 'request' function from the server helper
  const { request } = useApi()

  // Destructure task options
  const {
    displayLoader = DisplayLoader.AUTO,
    params = {},
    indexedParam = '',
    reverseData = false,
    enableLog = false,
  } = options

  // Check if data is already being fetched for the specified key
  if (store.isFetchingData[key]) {
    if (enableLog) {
      console.warn('LocalDB - DATA FETCHING ALREADY IN PROGRESS FOR KEY:', key)
    }
    // TODO: Fix infinite loader issue
    // return
  }

  // Set flag to indicate that data fetching is in progress
  store.isFetchingData[key] = true

  // Determine whether to display the loader based on options and existing data
  const isArrayData = Array.isArray(store.data[key])
  const isEmptyArrayData =
    isArrayData && (!store.data[key] || store.data[key].length === 0)
  const isEmptyObjectData =
    !isArrayData &&
    (!store.data[key][params[indexedParam]] ||
      store.data[key][params[indexedParam]].length === 0)

  store.displayLoader[key] =
    displayLoader === DisplayLoader.AUTO
      ? isEmptyArrayData || isEmptyObjectData
      : displayLoader === DisplayLoader.ENABLED

  // Modify the keys of the params object for dynamic URL generation
  const modifiedParams: { [key: string]: any } = {}
  Object.keys(params).forEach((originalKey) => {
    const modifiedKey = `{${originalKey}}`
    modifiedParams[modifiedKey] = params[originalKey]
  })

  if (enableLog) {
    console.info('LocalDB - KEY:', key)
    console.info('LocalDB - DATA TYPE:', isArrayData ? 'ARRAY' : 'OBJECT')
    console.info(
      'LocalDB - INITIAL DATA:',
      isArrayData ? store.data[key] : store.data[key][params[indexedParam]]
    )
    console.info('LocalDB - DISPLAY LOADER:', store.displayLoader[key])
    console.info('LocalDB - PARAMS:', params)
  }

  // Send a request to fetch data from the specified path
  const task = await request({ url: replaceStringParts(path, modifiedParams) })

  // If the fetch operation is successful and data is received, update the store
  if (task.success && task.result.data) {
    if (Array.isArray(store.data[key])) {
      // Update array data in the store, optionally reversing the order
      store.data[key] =
        (reverseData ? task.result.data?.reverse() : task.result.data) || []
    } else {
      // Update non-array data in the store, optionally reversing the order
      store.data[key][params[indexedParam]] =
        (reverseData ? task.result.data?.reverse() : task.result.data) || []
    }

    if (enableLog)
      console.info(
        `LocalDB - DATA FETCHED FOR ${key}:`,
        isArrayData ? store.data[key] : store.data[key][params[indexedParam]]
      )
  } else if (enableLog) {
    console.error(`LocalDB - ERROR FETCHING DATA FOR ${key}:`, task.result.data)
  }

  // Reset flags to indicate that data fetching is complete
  store.isFetchingData[key] = false
  store.displayLoader[key] = false
}

// Define the root store
export const useLocalDb = defineStore(`local-db`, {
  state: () => ({}),
  getters: {},
  actions: {},
})

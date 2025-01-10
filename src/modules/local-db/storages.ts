import { ENCRYPTION_KEY } from '@/utils/constants'

import CryptoJS from 'crypto-js'
import localforage from 'localforage'

localforage.config({
  driver: [localforage.INDEXEDDB],
  name: 'App Local DB',
  storeName: 'localdb',
})

export default [
  {
    storage: {
      getItem: async (key: string) => {
        try {
          const encrypted: string | null = await localforage.getItem(key)
          if (encrypted)
            return CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(
              CryptoJS.enc.Utf8
            )
          else return encrypted
        } catch (error) {
          console.log(error)
        }
      },
      setItem: async (key: string, value: any) => {
        try {
          const encrypted = CryptoJS.AES.encrypt(
            value,
            ENCRYPTION_KEY
          ).toString()
          await localforage.setItem(key, encrypted)
        } catch (error) {
          console.log(error)
        }
      },
      removeItem: async (key: string) => {
        try {
          await localforage.removeItem(key)
        } catch (error) {
          console.log(error)
        }
      },
    },
  },
]

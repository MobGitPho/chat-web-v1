import { ProfileType } from '@/enums/profile-type'

import { UserModel } from '@/models/user'

import { fetchLocalDbData } from '../index'
import localDbStorages from '../storages'
import { ContextState, DataConfig, DisplayLoader } from '../types'

interface DataKeyConfig {
  admins: DataConfig
}

type DataKey = keyof DataKeyConfig

interface AdminsState extends ContextState {
  data: Record<DataKey, UserModel[] | { [key: string | number]: UserModel[] }>
  displayLoader: Record<DataKey, boolean>
  isFetchingData: Record<DataKey, boolean>
}

export const adminsConfig: DataKeyConfig = {
  admins: {
    path: `/users/type/${ProfileType.ADMIN}`,
  },
}

export const useAdminsLocalDb = defineStore(`local-db/admins`, {
  state: (): AdminsState => ({
    data: {
      admins: [],
    },
    displayLoader: {
      admins: false,
    },
    isFetchingData: {
      admins: false,
    },
  }),
  getters: {
    admins: (state) => (state.data.admins as UserModel[]) || [],
  },
  actions: {
    async fetchData(
      key: DataKey,
      {
        displayLoader = DisplayLoader.AUTO,
        params = {},
      }: { displayLoader?: DisplayLoader; params?: any } = {}
    ) {
      await fetchLocalDbData(this, key, adminsConfig[key].path, {
        displayLoader,
        params,
        indexedParam: adminsConfig[key].indexedParam,
      })
    },
  },
  persistence: {
    enabled: true,
    storageItems: localDbStorages,
  },
})

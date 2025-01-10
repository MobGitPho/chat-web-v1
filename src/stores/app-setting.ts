import { AppSettingModel } from '@/models/app-setting'

export interface AppSettingState {
  settings: AppSettingModel[]
}

export interface AppSettingObject {
  disableInstaller: string
  allowRegistration: string
  adminProfileTypeLabel: string
  displayAdminProfileType: string
}

export type AppSettingKey = keyof AppSettingObject

export type AppSettingType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'

export const useAppSettingStore = defineStore('app-setting', {
  state: (): AppSettingState => ({
    settings: [],
  }),
  getters: {
    getSetting: (state) => (key: AppSettingKey) => {
      return state.settings.find((s) => s.key === key)
    },
    getSettingValue:
      (state) =>
      (key: AppSettingKey, type: AppSettingType = 'string') => {
        const setting = state.settings.find((s) => s.key === key)

        let value: unknown = ''

        switch (type) {
          case 'number':
            value =
              setting &&
              parseInt(setting.value) &&
              !isNaN(parseInt(setting.value))
                ? parseInt(setting.value)
                : 0

            break

          case 'boolean':
            value =
              setting &&
              !isNaN(parseInt(setting.value)) &&
              parseInt(setting.value) > 0

            break

          case 'object':
            value = setting && setting.value ? JSON.parse(setting.value) : {}

            break

          case 'array':
            value = setting && setting.value ? JSON.parse(setting.value) : []

            break

          default:
            value = setting && setting.value ? setting.value : ''

            break
        }

        return value
      },
  },
  actions: {
    async initDefaultSettings() {
      await this.loadSettings()

      const defaultSettings: AppSettingObject = {
        disableInstaller: '1',
        allowRegistration: '1',
        adminProfileTypeLabel: '',
        displayAdminProfileType: '1',
      }

      const { request } = useApi()

      await request({
        url: '/app-settings',
        method: 'put',
        data: defaultSettings,
      })

      await this.loadSettings()
    },
    async loadSettings() {
      const { request } = useApi()

      const task = await request({
        url: '/app-settings',
      })

      if (task.success && task.result) this.settings = task.result.data
      else this.settings = []
    },
  },
})

export interface HelperState {
  nextRouteName: string | null
  previousRouteName: string | null
  lastHomeRoutePath: string | null
}

export const useHelperStore = defineStore('helper', {
  state: (): HelperState => ({
    nextRouteName: null,
    previousRouteName: null,
    lastHomeRoutePath: null,
  }),
  getters: {},
  actions: {},
})

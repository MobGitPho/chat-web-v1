export interface RedirectionState {
  toSomeRoute: boolean
}

export const useRedirectionStore = defineStore('redirection', {
  state: (): RedirectionState => ({
    toSomeRoute: false,
  }),
  getters: {},
  actions: {},
})

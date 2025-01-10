export interface UserInterfaceState {
  isLightTheme: boolean
  sidebarCollapsed: boolean
  contentLayoutSize: { height: number; width: number }
  contentScrollPosition: {
    scrollTop: number
    scrollLeft: number
    scrollHeight: number
  }
}

export const useUserInterfaceStore = defineStore('user-interface', {
  state: (): UserInterfaceState => ({
    isLightTheme: true,
    sidebarCollapsed: false,
    contentLayoutSize: { height: 0, width: 0 },
    contentScrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 0,
    },
  }),
  getters: {},
  actions: {},
})

import { NotificationModel } from '@/models/notification'

const REFRESH_INTERVAL = 15

export interface NotificationState {
  notifications: NotificationModel[]
  firstRefresh: boolean
  isRefreshing: boolean
  firstDisplayedNotificationId: string
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    firstRefresh: false,
    isRefreshing: false,
    firstDisplayedNotificationId: '',
  }),
  getters: {},
  actions: {
    async startNotificationsListener() {
      this.firstRefresh = true

      const authStore = useAuthStore()

      setInterval(async () => {
        this.isRefreshing = true

        if (authStore.userData?.id) await this.getNotifications()

        this.isRefreshing = false
        this.firstRefresh = false
      }, REFRESH_INTERVAL * 1000)
    },
    async getNotifications() {
      const { request } = useApi()

      const task = await request({
        url: `/notifications`,
      })

      if (task.success && !_.isEqual(this.notifications, task.result.data))
        this.notifications = task.result.data
      else task.result.data = this.notifications

      return task
    },
  },
})

import { differenceFromNow } from '@/utils/chronos'

import Routes from '@/router/routes'

import { NotificationModel } from '@/models/notification'

import { CheckFilled, FolderOpenFilled } from '@vicons/material'

import { NButton, NIcon } from 'naive-ui'

import router from '@/router'

export const useNotification = () => {
  const { t, locale } = useI18n()

  const { request } = useApi()

  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  const notificationDisplayer = useNaiveNotification()

  const isRead = (notification: NotificationModel) => !!notification.readAt

  const isUnread = (notification: NotificationModel) => !notification.readAt

  const userReadNotifications = computed(() =>
    notificationStore.notifications.filter((notification) =>
      isRead(notification)
    )
  )

  const userUnreadNotifications = computed(() =>
    notificationStore.notifications.filter((notification) =>
      isUnread(notification)
    )
  )

  async function markAsRead(notification: NotificationModel, refresh = true) {
    await request({
      url: `/notifications/mark/${notification.id}`,
      method: 'put',
    })

    if (refresh) notificationStore.getNotifications()
  }

  async function markAllAsRead() {
    await request({
      url: `/notifications/mark-all`,
      method: 'put',
    })

    notificationStore.getNotifications()
  }

  async function removeNotification(notification: NotificationModel) {
    await request({
      url: `/notifications/${notification.id}`,
      method: 'delete',
    })

    notificationStore.getNotifications()
  }

  const buildMessage = async (notification: NotificationModel) => {
    let title = '',
      content = ''

    switch (notification.type) {
      default:
        title = notification.data.title
        content = notification.data.content
        break
    }

    return { title, content }
  }

  const displayNotification = async (notification: NotificationModel) => {
    if (router.currentRoute.value.name != Routes.NOTIFICATIONS.NAME) {
      const { title, content } = await buildMessage(notification)

      const n = notificationDisplayer.create({
        title,
        content,
        meta: differenceFromNow(notification?.createdAt || '', {
          locale: locale.value,
        }),
        action: () => {
          return h('div', { class: 'flex align-center justify-between' }, [
            notification.data.target
              ? h(
                  NButton,
                  {
                    text: true,
                    renderIcon: () =>
                      h(NIcon, null, {
                        default: () => h(FolderOpenFilled),
                      }),
                    onClick: () => {
                      markAsRead(notification)
                      router.push(notification.data.target)
                      n.destroy()
                    },
                    style: 'margin-right: 10px',
                  },
                  {
                    default: () => t('open'),
                  }
                )
              : h('span'),
            h(
              NButton,
              {
                text: true,
                renderIcon: () =>
                  h(NIcon, null, {
                    default: () => h(CheckFilled),
                  }),
                onClick: () => {
                  markAsRead(notification)
                  n.destroy()
                },
              },
              {
                default: () => t('read'),
              }
            ),
          ])
        },
        onClose: () => {
          markAsRead(notification)
        },
      })
    }
  }

  watch(
    () => userUnreadNotifications.value,
    async (notifications) => {
      if (
        notifications.length &&
        notifications[0].id != notificationStore.firstDisplayedNotificationId
      ) {
        notificationStore.firstDisplayedNotificationId =
          notifications[0].id || ''
        for (let i = 0; i < 5; i++) {
          const notification = notifications[i]
          if (
            notification &&
            authStore.userData?.preferences?.inAppNotifEnabled
          ) {
            displayNotification(notification)

            await new Promise((resolve) => setTimeout(resolve, 5000))
          }
        }
      }
    },
    {
      immediate: true,
      deep: true,
    }
  )

  return {
    userReadNotifications,
    userUnreadNotifications,
    isRead,
    isUnread,
    markAsRead,
    markAllAsRead,
    removeNotification,
    buildMessage,
  }
}

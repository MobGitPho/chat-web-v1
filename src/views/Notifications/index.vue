<script lang="ts">
  export default defineComponent({
    name: Routes.NOTIFICATIONS.NAME,
  })
</script>

<script setup lang="ts">
  import { abbreviateNumber } from '@/utils/functions.js'

  import { NotificationModel } from '@/models/notification'

  import { BellSlash } from '@vicons/fa'
  import {
    AccessTimeFilled,
    CheckFilled,
    DeleteFilled,
    MarkAsUnreadFilled,
    MarkunreadFilled,
    RefreshFilled,
  } from '@vicons/material'

  import { NBadge, NIcon } from 'naive-ui'
  import type { MenuOption } from 'naive-ui'

  import Item from './Item.vue'

  import Routes from '@/router/routes'

  const { t } = useI18n()

  const { isMdScreen, isSmScreen, pickByTheme, appPrimaryColor } = useHelper()

  const activeMenuItem = ref('all')
  const isLoading = ref(false)

  const loadingBar = useLoadingBar()

  const notificationStore = useNotificationStore()
  const uiStore = useUserInterfaceStore()

  const { userUnreadNotifications, markAllAsRead } = useNotification()

  const menuOptions = computed<MenuOption[]>(() => {
    return [
      {
        label: () =>
          h('div', { class: 'flex justify-between items-center w-full' }, [
            h(
              'span',
              { class: 'mr-1 text-white' },
              { default: () => t('all') }
            ),
            h(NBadge, {
              value: abbreviateNumber(
                notificationStore.notifications.length || 0
              ),
              type: 'info',
            }),
          ]),
        key: 'all',
        icon: () =>
          h(NIcon, { color: 'white' }, { default: () => h(MarkunreadFilled) }),
      },
      {
        label: () =>
          h('div', { class: 'flex justify-between items-center w-full' }, [
            h(
              'span',
              { class: 'mr-1 text-white' },
              { default: () => t('unread') }
            ),
            h(NBadge, {
              value: abbreviateNumber(
                userUnreadNotifications.value.length || 0
              ),
              type: 'error',
            }),
          ]),
        key: 'unread',
        icon: () =>
          h(
            NIcon,
            { color: 'white' },
            { default: () => h(MarkAsUnreadFilled) }
          ),
      },
    ]
  })

  const content = computed<NotificationModel[]>(() => {
    let list: NotificationModel[] | undefined
    switch (activeMenuItem.value) {
      case 'all':
        list = notificationStore.notifications
        break
      case 'unread':
        list = userUnreadNotifications.value
        break

      default:
        list = []
        break
    }

    return list
  })

  const layoutHeight = computed(() => {
    return uiStore.contentLayoutSize.height - 100
  })

  const refresh = async () => {
    isLoading.value = true
    loadingBar.start()

    await notificationStore.getNotifications()

    loadingBar.finish()
    isLoading.value = false
  }

  watch(
    () => notificationStore.firstRefresh,
    (val) => {
      if (val) loadingBar.start()
      else loadingBar.finish()
    },
    {
      immediate: true,
    }
  )
</script>

<template>
  <section>
    <template v-if="!notificationStore.firstRefresh">
      <n-layout :style="'height: ' + layoutHeight + 'px'" embedded>
        <n-layout-header style="height: 48px; padding: 8px 15px" bordered>
          <n-space justify="space-between" align="center">
            <n-button text @click="refresh">
              <template #icon>
                <n-icon>
                  <RefreshFilled />
                </n-icon>
              </template>
              {{ t('refresh') }}
            </n-button>
            <n-button
              text
              :disabled="!userUnreadNotifications.length"
              @click="markAllAsRead">
              <template #icon>
                <n-icon>
                  <CheckFilled />
                </n-icon>
              </template>
              {{ t('allMarkedAsRead') }}
            </n-button>
          </n-space>
        </n-layout-header>

        <n-layout position="absolute" style="top: 48px" has-sider>
          <n-layout-sider
            :style="`background-color: ${pickByTheme(
              appPrimaryColor,
              'rgba(24, 24, 28, 1)'
            )}`"
            collapse-mode="width"
            :native-scrollbar="false"
            :collapsed-width="64"
            :collapsed="isMdScreen || isSmScreen"
            :width="260"
            bordered>
            <n-menu
              v-model:value="activeMenuItem"
              :collapsed="isMdScreen || isSmScreen"
              :collapsed-width="64"
              :collapsed-icon-size="22"
              :options="menuOptions" />
          </n-layout-sider>
          <n-layout
            content-style="padding: 5px; padding-right: 0"
            :native-scrollbar="false">
            <n-list v-if="content.length" hoverable clickable bordered>
              <template v-for="(item, i) in content" :key="i">
                <Item :item="item" />
              </template>
            </n-list>
            <n-empty
              v-else
              :description="t('noNotificationAtThisTime')"
              size="huge"
              class="empty-container">
              <template #icon>
                <n-icon size="56">
                  <BellSlash />
                </n-icon>
              </template>
            </n-empty>
          </n-layout>
        </n-layout>
      </n-layout>
    </template>

    <n-layout v-else :style="'height: ' + layoutHeight + 'px'" embedded>
      <n-layout-header style="height: 48px; padding: 8px 15px" bordered>
        <n-space justify="space-between" align="center">
          <n-skeleton text style="width: 125px" />
          <n-skeleton text style="width: 125px" />
        </n-space>
      </n-layout-header>

      <n-layout position="absolute" style="top: 48px" has-sider>
        <n-layout-sider
          collapse-mode="width"
          :native-scrollbar="false"
          :collapsed-width="64"
          :collapsed="false"
          :width="260"
          bordered>
          <n-skeleton height="35px" width="100%" class="mb-1" />
          <n-skeleton height="35px" width="100%" />
        </n-layout-sider>
        <n-layout
          content-style="padding: 5px; padding-right: 0"
          :native-scrollbar="false">
          <n-list hoverable clickable bordered>
            <n-list-item class="item w-full">
              <n-thing>
                <template #header>
                  <n-skeleton text style="width: 150px" />
                </template>
                <template #header-extra>
                  <n-badge color="gray" dot></n-badge>
                </template>
                <template #description>
                  <n-skeleton text style="width: 100%" :repeat="2" />
                </template>
                <template #footer>
                  <n-space align="center" justify="space-between">
                    <n-button text size="tiny" style="cursor: default">
                      <template #icon>
                        <n-icon><AccessTimeFilled /></n-icon>
                      </template>
                      <n-skeleton text style="width: 60px" />
                    </n-button>
                    <n-space align="center">
                      <n-button text>
                        <template #icon>
                          <n-icon><DeleteFilled /></n-icon>
                        </template>
                        <n-skeleton text style="width: 60px" />
                      </n-button>
                    </n-space>
                  </n-space>
                </template>
              </n-thing>
            </n-list-item>
            <n-list-item class="item w-full">
              <n-thing>
                <template #header>
                  <n-skeleton text style="width: 150px" />
                </template>
                <template #header-extra>
                  <n-badge color="gray" dot></n-badge>
                </template>
                <template #description>
                  <n-skeleton text style="width: 100%" :repeat="2" />
                </template>
                <template #footer>
                  <n-space align="center" justify="space-between">
                    <n-button text size="tiny" style="cursor: default">
                      <template #icon>
                        <n-icon><AccessTimeFilled /></n-icon>
                      </template>
                      <n-skeleton text style="width: 60px" />
                    </n-button>
                    <n-space align="center">
                      <n-button text>
                        <template #icon>
                          <n-icon><DeleteFilled /></n-icon>
                        </template>
                        <n-skeleton text style="width: 60px" />
                      </n-button>
                    </n-space>
                  </n-space>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-layout>
      </n-layout>
    </n-layout>
  </section>
</template>

<style scoped>
  .empty-container {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

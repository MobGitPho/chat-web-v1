<script setup lang="ts">
  import { getNameInitials } from '@/utils/functions'

  import Routes from '@/router/routes'

  import { Moon, Sun } from '@vicons/fa'
  import {
    AccountCircleFilled,
    KeyboardArrowDownFilled,
    LogOutFilled,
    MenuFilled,
    MenuOpenFilled,
    MoreVertFilled,
    NotificationsFilled,
    SettingsFilled,
  } from '@vicons/material'

  import { NAvatar, NBadge, NIcon, NSpace } from 'naive-ui'
  import type { MenuOption } from 'naive-ui'

  import slugify from 'slugify'
  import { Component, h } from 'vue'

  const uiStore = useUserInterfaceStore()
  const authStore = useAuthStore()

  const {
    pickByTheme,
    isMdScreen,
    isSmScreen,
    languages,
    updateLocale,
    appSecondaryColor,
    appPrimaryColor,
  } = useHelper()
  const { userHasSuperAdminRole } = useAccess()
  const { userUnreadNotifications } = useNotification()
  const { locale, t } = useI18n()
  const { request } = useApi()

  const dialog = useDialog()

  const router = useRouter()
  const route = useRoute()

  const renderIcon = (icon: Component, style: any = null) => {
    return () => h(NIcon, style, { default: () => h(icon) })
  }

  const rightNavMenuOptions = computed<MenuOption[]>(() => {
    const items: MenuOption[] = [
      {
        label: () =>
          isSmScreen.value
            ? h(
                'span',
                { class: 'text-black ml-1' },
                { default: () => authStore.userData?.fullname }
              )
            : h('div', { class: 'flex align-center justify-between' }, [
                h(
                  'div',
                  { class: 'text-white' },
                  { default: () => authStore.userData?.fullname }
                ),
                h(
                  NIcon,
                  { size: 24, color: 'white' },
                  { default: () => h(KeyboardArrowDownFilled, {}) }
                ),
              ]),
        key: 'avatar-name',
        icon: () =>
          authStore.userData?.avatarUrl
            ? h(NAvatar, {
                size: 'medium',
                src: authStore.userData?.avatarUrl,
              })
            : h(
                NAvatar,
                {
                  size: 'medium',
                  style: {
                    width: '36px',
                    height: '36px',
                    display: 'block',
                    backgroundColor: appSecondaryColor,
                  },
                },
                {
                  default: () =>
                    getNameInitials(authStore.userData?.fullname || ''),
                }
              ),
        children: [
          {
            label: t('accountInfo'),
            key: slugify(Routes.ACCOUNT.NAME),
            icon: renderIcon(AccountCircleFilled),
          },
          {
            label: t('toLogout'),
            key: 'logout',
            icon: renderIcon(LogOutFilled),
          },
        ],
      },
      {
        label: () =>
          h('div', { class: 'flex align-center justify-between' }, [
            h(
              'div',
              { class: isSmScreen.value ? 'text-black' : 'text-white' },
              { default: () => t('notifications') }
            ),
            h(NBadge, {
              dot: !!userUnreadNotifications.value.length,
              type: 'error',
              color: 'white',
            }),
          ]),
        key: slugify(Routes.NOTIFICATIONS.NAME),
        disabled: !authStore.userData?.preferences?.inAppNotifEnabled,
        icon: renderIcon(NotificationsFilled, { color: 'white' }),
      },
    ]

    if (userHasSuperAdminRole()) {
      items.push({
        label: () =>
          h(
            'div',
            { class: isSmScreen.value ? 'text-black' : 'text-white' },
            { default: () => t('settings') }
          ),
        key: slugify(Routes.SETTINGS.NAME),
        icon: renderIcon(SettingsFilled, { color: 'white' }),
      })
    }

    return items
  })

  const handleUpdateValue = (key: string) => {
    switch (key) {
      case 'logout':
        {
          const logoutDialog = dialog.warning({
            title: t('confirmation'),
            content: t('confirmLogoutMessage'),
            positiveText: t('yes'),
            negativeText: t('no'),
            onPositiveClick: async () => {
              logoutDialog.loading = true

              const task = await request({
                url: '/auth/logout',
              })

              logoutDialog.loading = false

              if (task.success) {
                authStore.resetAuthData()

                router.replace(Routes.LOGIN.PATH)
              }
            },
          })
        }
        break

      case slugify(Routes.SETTINGS.NAME):
        router.push(Routes.SETTINGS.PATH)
        break

      case slugify(Routes.NOTIFICATIONS.NAME):
        router.push(Routes.NOTIFICATIONS.PATH)
        break

      case slugify(Routes.ACCOUNT.NAME):
        router.push(Routes.ACCOUNT.PATH)
        break
    }
  }

  const borderColor = computed(() =>
    pickByTheme('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.09)')
  )
</script>

<template>
  <n-layout-header
    bordered
    position="absolute"
    class="header-layout"
    :style="`background-color: ${pickByTheme(
      appPrimaryColor,
      'rgba(24, 24, 28, 1)'
    )}`">
    <div class="header-layout-container flex items-center justify-between">
      <n-space class="header-left" justify="space-between" align="center">
        <n-icon
          :size="40"
          color="white"
          class="cursor-pointer flex align-middle"
          @click="uiStore.sidebarCollapsed = !uiStore.sidebarCollapsed"
          ><MenuFilled v-if="uiStore.sidebarCollapsed" />
          <MenuOpenFilled v-else />
        </n-icon>
      </n-space>
      <n-space align="center">
        <div class="flex items-center justify-between">
          <n-menu
            v-if="!isSmScreen"
            class="right-nav-menu"
            mode="horizontal"
            :icon-size="24"
            :options="rightNavMenuOptions"
            :value="slugify(String(route.name))"
            dropdown-placement="bottom"
            @update:value="handleUpdateValue" />
          <n-dropdown
            v-else
            trigger="hover"
            :options="rightNavMenuOptions"
            @select="handleUpdateValue">
            <n-icon size="30"><MoreVertFilled /></n-icon>
          </n-dropdown>
        </div>
        <n-space
          v-if="!(isMdScreen || isSmScreen)"
          justify="space-between"
          align="center">
          <n-select
            v-model:value="locale"
            :consistent-menu-width="false"
            size="tiny"
            :options="(languages as any[])"
            @update:value="updateLocale" />

          <n-switch v-model:value="uiStore.isLightTheme" size="small">
            <template #checked-icon>
              <n-icon :component="Sun" color="orange" />
            </template>
            <template #unchecked-icon>
              <n-icon :component="Moon" color="dimgray" />
            </template>
            <template #checked> <div class="w-4"></div> </template>
            <template #unchecked> <div class="w-4"></div> </template>
          </n-switch>
        </n-space>
      </n-space>
    </div>
  </n-layout-header>
</template>

<style lang="scss" scoped>
  .header-layout {
    height: 60px;
    z-index: 1000;
    padding: 0 32px 0 12px;
    border-bottom: 1px solid v-bind(borderColor) !important;
    .header-layout-container {
      height: 100%;
    }
  }
  ::v-deep(
      .right-nav-menu
        > .n-submenu
        > .n-menu-item
        > .n-menu-item-content
        > .n-menu-item-content__icon
    ) {
    width: 36px !important;
  }

  ::v-deep(.right-nav-menu) {
    padding-top: 5px;
  }
</style>

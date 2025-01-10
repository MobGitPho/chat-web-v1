<script setup lang="ts">
  import icon from '@/assets/images/icon-reverse.svg'
  import logo from '@/assets/images/logo-reverse.svg'

  import Routes from '@/router/routes'

  import { NIcon } from 'naive-ui'
  import type { MenuOption } from 'naive-ui'

  import slugify from 'slugify'
  import { Component } from 'vue'
  import { RouterLink } from 'vue-router'

  const route = useRoute()
  const router = useRouter()
  const { userHasAccessToRoute, userRoleIncludeThisRoute } = useAccess()
  const {
    pickByTheme,
    isMdScreen,
    isSmScreen,
    isXlScreen,
    is2XlScreen,
    appPrimaryColor,
  } = useHelper()

  const uiStore = useUserInterfaceStore()
  const authStore = useAuthStore()

  const updateCollapsed = (collapsed: boolean) => {
    uiStore.sidebarCollapsed = collapsed
  }

  const renderIcon = (icon: Component, style: any = null) => {
    return () => h(NIcon, style, { default: () => h(icon) })
  }

  const sidebarMenuOptions = computed<MenuOption[]>(() => {
    const items: MenuOption[] = []
    const routes = router.options.routes

    const childLabelColor =
      uiStore.sidebarCollapsed && uiStore.isLightTheme
        ? 'text-black'
        : 'text-white'
    const childIconColor =
      uiStore.sidebarCollapsed && uiStore.isLightTheme ? 'black' : 'white'
    const textSize =
      is2XlScreen.value || isXlScreen.value ? 'text-base' : 'text-sm'

    if (!authStore.isUserConnected) return items

    routes.forEach((route, i) => {
      // @ts-ignore
      if (!route.hidden) {
        const divider = {
          key: 'divider-' + i,
          type: 'divider',
          props: {
            style: {
              marginLeft: '32px',
              marginTop: is2XlScreen.value ? '6px' : '1px',
              marginBottom: is2XlScreen.value ? '6px' : '1px',
              backgroundColor: `${pickByTheme(
                appPrimaryColor,
                'rgba(24, 24, 28, 1)'
              )}`,
            },
          },
        }

        if (userHasAccessToRoute(route) && userRoleIncludeThisRoute(route)) {
          const sidebarMenuItem: MenuOption = {
            label: () =>
              route.children && route.children.length
                ? h(
                    'div',
                    { class: `text-white ${textSize} ml-4` },
                    { default: () => route.meta?.title || '' }
                  )
                : h(
                    RouterLink,
                    {
                      to: route.path,
                    },
                    {
                      default: () =>
                        h(
                          'div',
                          { class: `text-white ${textSize} ml-4` },
                          { default: () => route.meta?.title || '' }
                        ),
                    }
                  ),
            key: slugify(route.name as string),
            icon: renderIcon(route.meta?.icon as Component, { color: 'white' }),
          }

          if (route.children && route.children.length) {
            sidebarMenuItem.children = []
            route.children.forEach((child) => {
              if (
                userHasAccessToRoute(child) &&
                userRoleIncludeThisRoute(child) &&
                // @ts-ignore
                !child.hidden
              ) {
                sidebarMenuItem.children?.push({
                  label: () =>
                    h(
                      RouterLink,
                      {
                        to: route.path + '/' + child.path,
                      },
                      {
                        default: () =>
                          h(
                            uiStore.sidebarCollapsed ? 'span' : 'div',
                            { class: `${childLabelColor} ${textSize} ml-4` },
                            { default: () => child.meta?.title || '' }
                          ),
                      }
                    ),
                  key: slugify(child.name as string),
                  icon: renderIcon(child.meta?.icon as Component, {
                    color: childIconColor,
                  }),
                })
              }
            })
          }

          items.push(sidebarMenuItem)
          items.push(divider)
        } else {
          if (
            route.children &&
            route.children.length &&
            userHasAccessToRoute(route.children[0]) &&
            userRoleIncludeThisRoute(route.children[0])
          ) {
            const sidebarMenuItem: MenuOption = {
              label: () =>
                h(
                  RouterLink,
                  // @ts-ignore
                  {
                    to: route.redirect,
                  },
                  {
                    default: () =>
                      h(
                        'div',
                        {
                          class: `text-white ${textSize} ml-4`,
                        },
                        {
                          default: () =>
                            route.children?.length
                              ? route.children[0].meta?.title
                              : '',
                        }
                      ),
                  }
                ),
              key: slugify(route.name as string),
              icon: renderIcon(route.children[0].meta?.icon as Component, {
                color: 'white',
              }),
            }

            items.push(sidebarMenuItem)
            items.push(divider)
          }
        }
      }
    })

    return items
  })

  const collapseMdSmScreenSidebar = () => {
    if (isMdScreen.value || isSmScreen.value) {
      if (!uiStore.sidebarCollapsed) uiStore.sidebarCollapsed = true
    }
  }

  const onClickMenuItem = () => collapseMdSmScreenSidebar()

  const sidebar = ref(null)

  onClickOutside(sidebar, () => collapseMdSmScreenSidebar())

  watch(
    () => [isMdScreen.value, isSmScreen.value],
    ([nv1, nv2]) => {
      uiStore.sidebarCollapsed = !!nv1 || !!nv2
    },
    {
      immediate: true,
    }
  )

  const menuValue = computed(() => {
    const parts = String(route.name).split('_')

    return slugify(parts.length > 1 ? parts[1] : String(route.name))
  })

  const title = import.meta.env.APP_NAME

  const borderColor = computed(() =>
    pickByTheme('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.09)')
  )
</script>

<template>
  <n-layout-sider
    ref="sidebar"
    position="static"
    collapse-mode="width"
    :show-trigger="false"
    :collapsed="uiStore.sidebarCollapsed"
    :collapsed-width="64"
    :width="is2XlScreen ? '325px' : '300px'"
    :native-scrollbar="false"
    class="sidebar-layout"
    :style="`background-color: ${pickByTheme(
      appPrimaryColor,
      'rgba(24, 24, 28, 1)'
    )}`"
    @update:collapsed="updateCollapsed">
    <div
      :style="`background-color: ${pickByTheme(
        appPrimaryColor,
        'rgba(24, 24, 28, 1)'
      )}`"
      class="flex justify-center pt-2 w-full absolute z-10">
      <img
        class="cursor-pointer h-16"
        :src="uiStore.sidebarCollapsed ? icon : logo"
        :alt="title"
        @click="router.push(Routes.DASHBOARD.PATH)" />
    </div>
    <n-menu
      accordion
      class="pt-24"
      :value="menuValue"
      :collapsed-width="64"
      :collapsed-icon-size="is2XlScreen ? 34 : 30"
      :icon-size="is2XlScreen ? 32 : 28"
      :indent="20"
      :options="sidebarMenuOptions"
      @update:value="onClickMenuItem" />
  </n-layout-sider>
</template>

<style scoped>
  .sidebar-layout {
    height: 100%;
    z-index: 1000;
    border-right: 1px solid v-bind(borderColor) !important;
  }
</style>

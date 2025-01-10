<script setup lang="ts">
  import Routes from '@/router/routes'

  const { locale } = useI18n()

  const route = useRoute()
  const router = useRouter()

  const authStore = useAuthStore()
  const helperStore = useHelperStore()

  useNotificationStore()

  const { languages, updateLocale } = useHelper()
  const { userHasAccessToRoute, userRoleIncludeThisRoute } = useAccess()

  // Manage redirections
  if (route.name === Routes.HOME.NAME) {
    if (authStore.isUserConnected) {
      if (helperStore.lastHomeRoutePath) {
        router.replace(helperStore.lastHomeRoutePath)
      } else {
        router.replace(Routes.DASHBOARD.PATH)
      }
    } else router.replace(Routes.LOGIN.PATH)
  }

  // Check if the user has access to the route
  watch(
    () => route,
    () => {
      const currentRoute = router.getRoutes().find((r) => r.path == route.path)
      if (
        currentRoute &&
        currentRoute.meta?.requiresAuth &&
        ![Routes.HOME.NAME].includes(String(currentRoute.name))
      ) {
        if (
          !authStore.userData?.profileId ||
          !authStore.userData?.profileType
        ) {
          router.replace(Routes.ACCOUNT_INFO_PORTAL.PATH)
        } else {
          if (
            userHasAccessToRoute(currentRoute) &&
            userRoleIncludeThisRoute(currentRoute)
          ) {
            // Access granted
          } else router.replace(Routes.DASHBOARD.PATH)
        }
      }
    },
    {
      immediate: true,
      deep: true,
    }
  )

  // Change current language if lang route query is provided
  onMounted(() => {
    if (route.query && route.query.lang) {
      const lang = String(route.query.lang)

      if (
        languages.map((l) => l.value).includes(lang) &&
        locale.value != lang
      ) {
        updateLocale(lang)
      }
    }
  })

  // Detect page reload and perform tasks
  onMounted(() => {
    // Check if the page is being reloaded
    const navigationEntries = window.performance.getEntriesByType('navigation')
    // @ts-ignore
    if (navigationEntries.length && navigationEntries[0].type === 'reload') {
      // If you have some tasks to perform when the page is reloaded
      // You can do it here
      // ...
    }
  })
</script>

<template>
  <MainLayout></MainLayout>
</template>

<style lang="scss" scoped></style>

<script setup lang="ts">
  import bgDark from '@/assets/images/background/auth-dark.svg'
  import bgLight from '@/assets/images/background/auth.svg'

  import Routes from '@/router/routes'

  import { Moon, Sun } from '@vicons/fa'
  import { MoveToInboxFilled } from '@vicons/material'

  interface Props {
    displayServerAlerts?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    displayServerAlerts: true,
  })

  const { t, locale } = useI18n()

  const { request } = useApi()
  const { pickByTheme, appPrimaryColor, isSmScreen, languages, updateLocale } =
    useHelper()

  const route = useRoute()
  const router = useRouter()
  const uiStore = useUserInterfaceStore()

  const serverAvailable = ref(true)
  const databaseAvailable = ref(true)
  onMounted(async () => {
    if (route.query && route.query.lang) {
      const lang = String(route.query.lang)

      if (
        languages.map((l) => l.value).includes(lang) &&
        locale.value != lang
      ) {
        updateLocale(lang)
      }
    }

    const task1 = await request({ url: '/' })
    serverAvailable.value = task1.success

    if (serverAvailable.value) {
      const task2 = await request({ url: '/database' })
      databaseAvailable.value = task2.success
    }
  })

  const bgColor = computed(() => pickByTheme(appPrimaryColor, '#282828'))
  const bgImage = computed(() => `url(${pickByTheme(bgLight, bgDark)})`)

  useHead({
    title: () =>
      (route?.meta?.title ? route?.meta?.title + ' - ' : '') +
      import.meta.env.APP_NAME,
  })
</script>

<template>
  <section
    v-if="props.displayServerAlerts && (!serverAvailable || !databaseAvailable)"
    class="fixed top-8 left-5 right-5 px-10">
    <n-alert
      v-if="!serverAvailable"
      :title="t('serverUnreachable')"
      type="error">
    </n-alert>
    <n-alert v-if="!databaseAvailable" type="warning">
      <template #header>
        <div class="flex items-center justify-between">
          {{ t('unableToConnectToDatabase') }}
          <div
            class="flex items-center justify-between cursor-pointer"
            @click="router.push(Routes.SETUP.PATH)">
            <n-icon>
              <MoveToInboxFilled />
            </n-icon>
            <span class="text-sm ml-1">{{ t('openInstaller') }}</span>
          </div>
        </div>
      </template>
    </n-alert>
  </section>
  <section class="h-screen flex items-center justify-center root-container">
    <slot></slot>
  </section>
  <section
    class="text-center py-2 px-4 fixed bottom-0 w-full border-solid border-t"
    :class="`${pickByTheme('border-slate-200', 'border-gray-500')}`"
    :style="`background: ${pickByTheme('white', 'rgba(24, 24, 28, 1)')}`">
    <n-space
      :justify="isSmScreen ? 'center' : 'space-between'"
      align="center"
      class="container mx-auto">
      <div class="text-xs text-gray-500">
        &copy; copyright {{ new Date().getFullYear() }} | JP
      </div>
      <n-space justify="center" align="center">
        <n-select
          v-model:value="locale"
          :consistent-menu-width="false"
          size="tiny"
          :options="(languages as any[])"
          @update:value="(newLocale: string) => updateLocale(newLocale, false)" />

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
  </section>
</template>

<style scoped>
  .root-container {
    background-image: v-bind(bgImage);
    background-color: v-bind(bgColor);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
</style>

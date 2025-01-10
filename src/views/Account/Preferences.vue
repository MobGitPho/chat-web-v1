<script setup lang="ts">
  import { UserPrefs } from '@/utils/types'

  import { Moon, Sun } from '@vicons/fa'
  import { SaveFilled } from '@vicons/material'

  const { t, locale } = useI18n()

  const authStore = useAuthStore()
  const uiStore = useUserInterfaceStore()

  const { languages, updateLocale, is2XlScreen, isXlScreen } = useHelper()
  const { defaultPrefs } = useUserPreference()
  const { request } = useApi()

  const message = useMessage()
  const loadingBar = useLoadingBar()

  const userPrefs = ref<UserPrefs>(defaultPrefs.value)
  const initialUserPrefs = ref<UserPrefs>(defaultPrefs.value)
  const isProceeding = ref<boolean>(false)

  const saveBtnDisabled = computed(() => {
    return _.isEqual(userPrefs.value, initialUserPrefs.value)
  })

  const submit = async () => {
    loadingBar.start()
    isProceeding.value = true

    const task = await request({
      url: `/users/self/${authStore.userData?.id}`,
      method: 'put',
      data: {
        preferences: userPrefs.value,
      },
    })

    if (task.success && task.result) {
      authStore.userData = task.result.data
      init()
      message.success(t('success'))
    } else message.error(t('anErrorOccured'))

    isProceeding.value = false
    loadingBar.finish()
  }

  const init = () => {
    userPrefs.value = (authStore.userData?.preferences ??
      defaultPrefs.value) as UserPrefs

    initialUserPrefs.value = _.cloneDeep(userPrefs.value)
  }

  init()
</script>

<template>
  <n-page-header class="mb-5">
    <template #title>
      {{ t('accountPreferences') }}
    </template>
    <template #extra>
      <n-space>
        <n-button
          :loading="isProceeding"
          :disabled="saveBtnDisabled"
          type="primary"
          @click="submit">
          <template #icon>
            <n-icon><SaveFilled /></n-icon>
          </template>
          {{ t('save') }}</n-button
        >
      </n-space>
    </template>
  </n-page-header>
  <n-card hoverable embedded>
    <n-grid cols="1 s:2 m:2 l:2 xl:2 2xl:2" responsive="screen" :x-gap="12">
      <n-gi>
        <n-card class="w-full">
          <n-space align="center" justify="space-between">
            <span>{{ t('notificationsInApp') }}</span>
            <n-switch
              v-model:value="userPrefs.inAppNotifEnabled"
              :checked-value="1"
              :unchecked-value="0"
              size="small">
              <template #checked> <div class="w-6"></div> </template>
              <template #unchecked> <div class="w-6"></div> </template>
            </n-switch>
          </n-space>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="w-full">
          <n-space align="center" justify="space-between">
            <span>{{ t('notificationsInEmail') }}</span>
            <n-switch
              v-model:value="userPrefs.emailNotifEnabled"
              :checked-value="1"
              :unchecked-value="0"
              size="small">
              <template #checked> <div class="w-6"></div> </template>
              <template #unchecked> <div class="w-6"></div> </template>
            </n-switch>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>
    <div class="h-2"></div>
    <n-grid
      v-if="!(isXlScreen || is2XlScreen)"
      cols="1 s:2 m:2 l:2 xl:2 2xl:2"
      responsive="screen"
      :x-gap="12">
      <n-gi>
        <n-card class="w-full">
          <n-space align="center" justify="space-between">
            <span>{{ t('appLanguage') }}</span>
            <n-select
              v-model:value="locale"
              :consistent-menu-width="false"
              size="tiny"
              :options="(languages as any[])"
              @update:value="updateLocale" />
          </n-space>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="w-full">
          <n-space align="center" justify="space-between">
            <span>{{ t('appTheme') }}</span>
            <n-switch v-model:value="uiStore.isLightTheme" size="small">
              <template #checked-icon>
                <n-icon :component="Sun" color="orange" />
              </template>
              <template #unchecked-icon>
                <n-icon :component="Moon" color="dimgray" />
              </template>
              <template #checked> <div class="w-6"></div> </template>
              <template #unchecked> <div class="w-6"></div> </template>
            </n-switch>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<style lang="scss"></style>

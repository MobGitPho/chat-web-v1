<script lang="ts">
  export default defineComponent({
    name: Routes.SETTINGS.NAME,
  })
</script>

<script setup lang="ts">
  import { AppSettingObject } from '@/stores/app-setting'

  import { AppSettingModel } from '@/models/app-setting'

  import { SaveFilled, SettingsBackupRestoreFilled } from '@vicons/material'

  import Routes from '@/router/routes'

  const { t } = useI18n()

  const { request } = useApi()

  const loadingBar = useLoadingBar()
  const message = useMessage()

  const appSettingStore = useAppSettingStore()

  const isProceeding = ref<boolean>(false)

  const settings = ref<AppSettingObject>({
    disableInstaller: '',
    allowRegistration: '',
    adminProfileTypeLabel: '',
    displayAdminProfileType: '',
  })
  const initialSettings = ref<AppSettingObject>(settings.value)

  const saveBtnDisabled = computed(() => {
    return _.isEqual(settings.value, initialSettings.value)
  })

  const submit = async () => {
    isProceeding.value = true

    const task = await request({
      url: `/app-settings`,
      method: 'put',
      data: settings.value,
    })

    if (task.success && task.result) {
      message.success(t('success'))
    } else {
      message.error(t('unableToUpdateSettings'))
    }

    await init()
  }

  const restoreDefaultSettings = async () => {
    isProceeding.value = true

    await appSettingStore.initDefaultSettings()

    await init()

    isProceeding.value = false
  }

  const init = async () => {
    loadingBar.start()
    isProceeding.value = true

    await appSettingStore.loadSettings()

    appSettingStore.settings?.forEach((setting: AppSettingModel) => {
      if (settings.value[setting.key as keyof typeof settings.value] != null) {
        settings.value[setting.key as keyof typeof settings.value] =
          setting.value
      }
    })

    initialSettings.value = _.cloneDeep(settings.value)

    isProceeding.value = false
    loadingBar.finish()
  }

  init()
</script>

<template>
  <PageLayout>
    <template #header-extra>
      <n-space>
        <n-button :loading="isProceeding" @click="restoreDefaultSettings">
          <template #icon>
            <n-icon><SettingsBackupRestoreFilled /></n-icon>
          </template>
          {{ t('restoreDefaultSettings') }}
        </n-button>
        <n-button
          :loading="isProceeding"
          :disabled="saveBtnDisabled"
          type="primary"
          @click="submit">
          <template #icon>
            <n-icon><SaveFilled /></n-icon>
          </template>
          {{ t('save') }}
        </n-button>
      </n-space>
    </template>
    <section>
      <n-card hoverable embedded>
        <template #header>
          {{ t('installationRegistration') }}
        </template>
        <n-grid
          cols="1 s:2 m:2 l:2 xl:2 2xl:2"
          responsive="screen"
          :x-gap="12"
          :y-gap="12">
          <n-gi>
            <n-card class="w-full" size="small">
              <n-space align="center" justify="space-between">
                <span>{{ t('disableInstaller') }}</span>
                <n-switch
                  v-model:value="settings.disableInstaller"
                  checked-value="1"
                  unchecked-value="0"
                  size="small">
                  <template #checked> <div class="w-6"></div> </template>
                  <template #unchecked> <div class="w-6"></div> </template>
                </n-switch>
              </n-space>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card class="w-full" size="small">
              <n-space align="center" justify="space-between">
                <span>{{ t('allowUsersRegistration') }}</span>
                <n-switch
                  v-model:value="settings.allowRegistration"
                  checked-value="1"
                  unchecked-value="0"
                  size="small">
                  <template #checked> <div class="w-6"></div> </template>
                  <template #unchecked> <div class="w-6"></div> </template>
                </n-switch>
              </n-space>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card class="w-full" size="small">
              <n-space align="center" justify="space-between">
                <span>{{ t('displayAdminProfileTypeAtRegistration') }}</span>
                <n-switch
                  v-model:value="settings.displayAdminProfileType"
                  checked-value="1"
                  unchecked-value="0"
                  :disabled="!parseInt(settings.allowRegistration)"
                  size="small">
                  <template #checked> <div class="w-6"></div> </template>
                  <template #unchecked> <div class="w-6"></div> </template>
                </n-switch>
              </n-space>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card class="w-full" size="small">
              <n-space align="center" justify="space-between">
                <span>{{ t('adminProfileTypeTitle') }}</span>
                <div class="w-[260px]">
                  <I18nInput
                    v-model="settings.adminProfileTypeLabel"
                    :placeholder="t('admin')"
                    :disabled="
                      !(
                        parseInt(settings.displayAdminProfileType) &&
                        parseInt(settings.allowRegistration)
                      )
                    "
                    size="tiny"
                    sync />
                </div>
              </n-space>
            </n-card>
          </n-gi>
        </n-grid>
      </n-card>
    </section>
  </PageLayout>
</template>

<style lang="scss"></style>
@/stores/app-setting@/models/app-setting

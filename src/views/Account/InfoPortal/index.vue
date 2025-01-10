<script lang="ts">
  export default defineComponent({
    name: Routes.ACCOUNT_INFO_PORTAL.NAME,
  })
</script>

<script setup lang="ts">
  import Routes from '@/router/routes'

  import { ProfileType } from '@/enums/profile-type'

  import Admin from './Admin.vue'

  import logo from '@/assets/images/logo.svg'

  const { t } = useI18n()
  const { profileTypes } = useProfileType()

  const { userHasSuperAdminRole } = useAccess()
  const { pickByTheme, appPrimaryColor } = useHelper()

  const appSettingStore = useAppSettingStore()

  // Settings
  const disableInstaller: boolean = appSettingStore.getSettingValue(
    'disableInstaller',
    'boolean'
  ) as boolean

  const displayAdminProfileType: boolean = appSettingStore.getSettingValue(
    'displayAdminProfileType',
    'boolean'
  ) as boolean

  // User types
  const profileType = ref<ProfileType | null>(null)

  const unsetProfileType = () => {
    profileType.value = null
  }

  const filteredProfileTypes = computed(() => {
    const list: any[] = []
    profileTypes.forEach((item) => {
      if (item.value == ProfileType.ADMIN) {
        if (userHasSuperAdminRole() || displayAdminProfileType) {
          list.push(item)
        }
      } else if (!userHasSuperAdminRole()) {
        list.push(item)
      }
    })

    return list
  })

  const title = import.meta.env.APP_NAME
</script>

<template>
  <AuthLayout :display-server-alerts="!disableInstaller">
    <div class="container h-full">
      <div
        class="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
        <div class="md:w-9/12 lg:w-6/12 xl:w-5/12 2xl:w-4/12 sm:w-full">
          <template v-if="!profileType">
            <n-card size="medium" class="w-full py-4">
              <div class="flex justify-center mb-4">
                <img :src="logo" class="w-24" :alt="title" />
              </div>
              <div class="text-center">
                <n-h4>
                  <n-text>
                    {{ t('youAreA') }}
                  </n-text>
                </n-h4>
              </div>
              <n-grid
                x-gap="12"
                y-gap="12"
                :cols="filteredProfileTypes.length > 1 ? 2 : 1"
                responsive="screen">
                <template v-for="(type, i) in filteredProfileTypes" :key="i">
                  <n-gi>
                    <CustomTransition name="slide-fade" appear>
                      <n-card
                        size="small"
                        class="cursor-pointer"
                        :class="
                          pickByTheme(
                            `hover:bg-[${appPrimaryColor}] hover:bg-opacity-10`,
                            'hover:bg-zinc-800'
                          )
                        "
                        @click="profileType = type.value">
                        <template #header>
                          <div class="text-center">
                            {{ type.label }}
                          </div>
                        </template>
                      </n-card>
                    </CustomTransition>
                  </n-gi>
                </template>
              </n-grid>
            </n-card>
          </template>
          <template v-else>
            <Admin
              v-if="profileType == ProfileType.ADMIN"
              @back="unsetProfileType" />
          </template>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped lang="scss"></style>

<script setup lang="ts">
  import Routes from '@/router/routes'

  import { HomeFilled, SearchOffFilled } from '@vicons/material'

  const { t } = useI18n()

  const router = useRouter()

  const { pickByTheme } = useHelper()

  useHead({
    title: () => t('404Error'),
  })
</script>

<template>
  <section :style="'background-color: ' + pickByTheme('#f5f5f5', '#282828')">
    <div class="container">
      <section>
        <n-result
          status="404"
          :title="t('404Error')"
          :description="t('404ErrorTitle')">
          <template #icon>
            <n-icon size="72">
              <SearchOffFilled />
            </n-icon>
          </template>
          <template #footer>
            <n-button type="primary" @click="router.push(Routes.LOGIN.PATH)">
              <template #icon>
                <n-icon>
                  <HomeFilled />
                </n-icon>
              </template>
              {{ t('404ErrorBack') }}
            </n-button>
          </template>
        </n-result>
      </section>
    </div>
  </section>
</template>

<style scoped>
  .container {
    width: 90vw;
    height: 100vh;
    margin: 0 auto;
  }

  .container section {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

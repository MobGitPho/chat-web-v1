<script setup>
  import * as pathToRegexp from 'path-to-regexp'

  const route = useRoute()
  const router = useRouter()
  const levelList = ref(null)

  const getBreadcrumb = () => {
    let matched = route.matched.filter((item) => item.meta && item.meta.title)

    matched = [{ redirect: 'noRedirect', meta: { title: '' } }].concat(matched)

    levelList.value = matched.filter(
      (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false
    )
  }

  const pathCompile = (path) => {
    const { params } = route
    var toPath = pathToRegexp.compile(path)
    return toPath(params)
  }

  const handleLink = (item) => {
    const { redirect, path } = item
    if (redirect) {
      router.push(redirect)
      return
    }
    router.push(pathCompile(path))
  }

  watch(
    () => route,
    () => {
      getBreadcrumb()
    },
    {
      immediate: true,
      deep: true,
    }
  )
</script>

<template>
  <n-breadcrumb class="app-breadcrumb" separator="/">
    <TransitionGroup name="breadcrumb">
      <template v-for="(item, index) in levelList" :key="item.path">
        <n-breadcrumb-item
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          :clickable="false">
          {{ item.meta.title }}
        </n-breadcrumb-item>
        <n-breadcrumb-item v-else @click.prevent="handleLink(item)">
          {{ item.meta.title }}
        </n-breadcrumb-item>
      </template>
    </TransitionGroup>
  </n-breadcrumb>
</template>

<style lang="scss" scoped>
  .breadcrumb-enter-active,
  .breadcrumb-leave-active {
    transition: all 0.5s ease;
  }
  .breadcrumb-enter-from,
  .breadcrumb-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>

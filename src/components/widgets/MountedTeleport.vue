<script setup lang="ts">
  interface Props {
    to: string
  }

  const props = withDefaults(defineProps<Props>(), {})

  const isMounted = ref(false)

  onMounted(() => {
    isMounted.value = true
  })

  onUnmounted(() => {
    isMounted.value = false
  })
</script>

<template>
  <Teleport v-if="isMounted" :to="props.to">
    <slot></slot>
  </Teleport>
</template>

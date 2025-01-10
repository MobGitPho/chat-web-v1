<script setup lang="ts">
  interface Props {
    modelValue: boolean
    maskClosable?: boolean
    segmented?: boolean
    closable?: boolean
    bordered?: boolean
    title?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    closable: true,
    segmented: true,
    bordered: false,
    maskClosable: false,
  })
  const emits = defineEmits(['update:modelValue', 'onSizeChange'])

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const dialogVisible = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emits('update:modelValue', value)
    },
  })

  const headerHeight = ref(0)

  const emitSizeChange = () => {
    const el = document.querySelector('.fullscreen-modal-header')

    if (!el) return

    const computedStyles = window.getComputedStyle(el)

    headerHeight.value = parseFloat(computedStyles.height)

    emits('onSizeChange', {
      windowWidth: windowWidth.value,
      windowHeight: windowHeight.value,
      headerHeight: headerHeight.value,
      contentHeight: windowHeight.value - headerHeight.value,
    })
  }

  watch(
    () => props.modelValue,
    (value) => {
      if (value) nextTick(() => emitSizeChange())
    }
  )

  watch(
    () => [windowWidth.value, windowHeight.value],
    () => emitSizeChange()
  )

  const slots = useSlots()

  const fixHeader = computed(() => {
    return !!slots['header'] || !!slots['header-extra']
  })

  const { pickByTheme } = useHelper()
</script>

<template>
  <n-modal
    v-model:show="dialogVisible"
    preset="card"
    :closable="props.closable"
    :segmented="props.segmented"
    :bordered="props.bordered"
    :mask-closable="props.maskClosable"
    :title="props.title"
    :style="`width: ${windowWidth}px; min-height: ${windowHeight}px`"
    :header-style="`background-color: ${pickByTheme(
      'white',
      'rgba(24, 24, 28, 1)'
    )}`"
    :header-class="`fullscreen-modal-header ${
      fixHeader ? `fixed top-0 w-full z-50` : ''
    } `"
    content-class="!p-0 fullscreen-modal-content">
    <template #header>
      <slot v-if="!!slots['header']" name="header" />
    </template>
    <template #header-extra>
      <slot v-if="!!slots['header-extra']" name="header-extra" />
    </template>
    <section :style="`margin-top: ${fixHeader ? headerHeight : '0'}px`">
      <slot></slot>
    </section>
  </n-modal>
</template>

<style scoped lang="scss"></style>

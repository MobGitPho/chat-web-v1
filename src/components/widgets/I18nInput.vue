<script lang="ts">
  export default defineComponent({
    name: 'I18nInput',
  })
</script>

<script setup lang="ts">
  import { SelectOption } from 'naive-ui'
  import { CSSProperties, VNodeChild } from 'vue'

  type Size = 'tiny' | 'small' | 'medium' | 'large'
  type Type = 'text' | 'textarea' | 'editor'

  interface Props {
    type?: Type
    size?: Size
    placeholder?: string
    inputStyles?: CSSProperties
    selectorSpan?: number
    displayFlag?: boolean
    disabled?: boolean
    reverse?: boolean
    sync?: boolean
    rows?: number
    contentEditorItems?: string[]
    modelValue: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    size: 'medium',
    placeholder: '',
    inputStyles: () => ({
      width: '100%',
    }),
    selectorSpan: 7,
    displayFlag: true,
    disabled: false,
    reverse: false,
    sync: false,
    rows: 2,
    contentEditorItems: () => [
      'fullScreen',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'code',
      'subscript',
      'superscript',
      'selectAll',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'horizontalLine',
      'blockQuote',
      'bulletedList',
      'numberedList',
      'alignment',
      '|',
      'outdent',
      'indent',
      '|',
      'link',
      'insertTable',
      'mediaEmbed',
      '|',
      'undo',
      'redo',
      '|',
      'sourceEditing',
    ],
  })

  const emits = defineEmits(['update:modelValue', 'codeChange'])

  const componentStore = defineStore('i18n-input', () => {
    const langCode = ref<string>('')

    return { langCode }
  })()

  const langCode = ref('')

  const content = computed({
    get() {
      let parsedValue

      try {
        parsedValue = JSON.parse(props.modelValue || '{}')
      } catch (e) {
        parsedValue = {}
      }

      return parsedValue[langCode.value] || ''
    },
    set(value) {
      let parsedValue

      try {
        parsedValue = JSON.parse(props.modelValue || '{}')
      } catch (e) {
        parsedValue = {}
      }

      parsedValue[langCode.value] = value

      emits('update:modelValue', JSON.stringify(parsedValue))
    },
  })

  watch(
    () => langCode.value,
    (newValue) => {
      emits('codeChange', newValue)

      componentStore.langCode = newValue
    }
  )

  watch(
    () => componentStore.langCode,
    (newValue) => {
      if (props.sync) langCode.value = newValue
    }
  )

  if (componentStore.langCode) langCode.value = componentStore.langCode

  const { languages } = useHelper()
  if (languages.length && !langCode.value) langCode.value = languages[0].value

  const renderLabel = (option: SelectOption): VNodeChild => {
    return h('div', { class: 'flex items-center' }, [
      props.displayFlag
        ? h('img', {
            src: option.flag,
            style: { width: '14px', marginRight: '4px' },
          })
        : h('span'),
      h('b', {}, { default: () => `${String(option.value).toUpperCase()}` }),
    ])
  }
</script>

<template>
  <n-grid cols="24" x-gap="2" style="width: 100%">
    <n-grid-item v-if="reverse" :span="selectorSpan">
      <n-select
        v-model:value="langCode"
        :disabled="props.disabled"
        :size="props.size"
        :options="(languages as any[])"
        :render-label="renderLabel"
        style="width: 100%"
        filterable />
    </n-grid-item>
    <n-grid-item :span="24 - selectorSpan">
      <template v-if="props.type == 'editor'">
        <CKEditorWrapper
          v-model="content"
          :style="inputStyles"
          :disabled="props.disabled"
          :placeholder="placeholder"
          :toolbar-items="contentEditorItems"
          :should-not-group-when-full="false" />
      </template>

      <template v-else-if="props.type == 'text'">
        <n-input
          v-model:value="content"
          :size="props.size"
          :type="props.type"
          :style="inputStyles"
          :placeholder="placeholder"
          :disabled="props.disabled" />
      </template>

      <template v-else-if="props.type == 'textarea'">
        <n-input
          v-model:value="content"
          :size="props.size"
          :type="props.type"
          :rows="rows"
          :style="inputStyles"
          :placeholder="placeholder"
          :disabled="props.disabled" />
      </template>
    </n-grid-item>
    <n-grid-item v-if="!reverse" :span="selectorSpan">
      <n-select
        v-model:value="langCode"
        :disabled="props.disabled"
        :size="props.size"
        :options="(languages as any[])"
        :render-label="renderLabel"
        style="width: 100%"
        filterable />
    </n-grid-item>
  </n-grid>
</template>

<style scoped>
  ::v-deep(.ck-editor__editable) {
    min-height: 100px;
  }

  ::v-deep(.ck.ck-toolbar-dropdown > .ck-dropdown__panel) {
    max-width: 500px;
  }
</style>

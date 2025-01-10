<script lang="ts">
  export default defineComponent({
    name: 'NFormFieldGenerator',
  })
</script>

<script setup lang="ts">
  import {
    FormInst,
    FormRules,
    FormValidationError,
    SelectOption,
  } from 'naive-ui'
  import { Item } from './helper'
  import { CSSProperties, VNodeChild } from 'vue'

  interface Props {
    modelValue: { [key: string]: any } | string
    useJson?: boolean
    items: Item[] | string
    formStyle?: CSSProperties
    labelStyle?: CSSProperties
  }

  const props = withDefaults(defineProps<Props>(), {
    useJson: false,
    formStyle: undefined,
    labelStyle: undefined,
  })

  const emits = defineEmits(['update:modelValue', 'update'])

  const { t } = useI18n()
  const { tr } = useHelper()

  let itemsProp: Item[] = []

  if (typeof props.items == 'string') {
    try {
      itemsProp = JSON.parse(props.items as string)
    } catch (e) {
      itemsProp = []
    }
  }

  let modelValueProp: { [key: string]: any } = {}

  if (props.useJson) {
    try {
      modelValueProp = JSON.parse(props.modelValue as string)
    } catch (e) {
      modelValueProp = {}
    }
  }

  const formKey = ref(uuidv4())
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<{ [key: string]: any }>(
    props.useJson
      ? modelValueProp
      : (props.modelValue as { [key: string]: any })
  )
  const rules: FormRules = {}

  itemsProp.forEach((item) => {
    if (!(item.key in formValue.value)) {
      if (['text', 'textarea', 'editor'].includes(item.type)) {
        formValue.value[item.key] = ''
      } else if (['number'].includes(item.type)) {
        formValue.value[item.key] = 0
      } else if (['checkbox'].includes(item.type)) {
        formValue.value[item.key] = false
      } else {
        formValue.value[item.key] = undefined
      }
    }

    if (item.required) {
      rules[item.key] = [
        {
          required: true,
          message: t('fillRequired'),
        },
      ]
    }

    formKey.value = uuidv4()
  })

  const contentEditorItems = [
    'fullScreen',
    '|',
    'heading',
    '|',
    'uploadImage',
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
  ]

  const renderSelectLabel = (option: SelectOption): VNodeChild => {
    return h(
      'span',
      {},
      {
        default: () => tr(option.label),
      }
    )
  }

  watch(
    () => formValue.value,
    (value) => {
      const finalValue = props.useJson ? JSON.stringify(value) : value

      const validate = async () => {
        let valid = false

        try {
          await formRef.value?.validate(
            (errors: Array<FormValidationError> | undefined) => {
              valid = !errors
            }
          )
        } catch (e) {
          valid = false
        }

        return valid
      }

      emits('update:modelValue', finalValue)
      emits('update', finalValue, validate)
    },
    {
      immediate: true,
      deep: true,
    }
  )
</script>

<template>
  <n-form
    ref="formRef"
    :key="formKey"
    :model="formValue"
    :rules="rules"
    :show-label="true"
    require-mark-placement="right-hanging"
    label-placement="left"
    label-align="left"
    label-width="auto"
    size="medium"
    :style="props.formStyle">
    <template v-for="(item, i) in itemsProp" :key="i">
      <n-form-item
        :label="tr(item.label)"
        :path="item.key"
        :label-style="props.labelStyle"
        :show-require-mark="item.required"
        class="w-full">
        <template v-if="item.type == 'text'">
          <n-input
            v-model:value="formValue[item.key]"
            :placeholder="tr(item.label)"
            type="text"
            class="w-full" />
        </template>
        <template v-else-if="item.type == 'textarea'">
          <n-input
            v-model:value="formValue[item.key]"
            :placeholder="tr(item.label)"
            type="textarea"
            class="w-full" />
        </template>
        <template v-else-if="item.type == 'editor'">
          <div class="w-full">
            <CKEditorWrapper
              v-model="formValue[item.key]"
              :placeholder="tr(item.label)"
              :toolbar-items="contentEditorItems"
              :should-not-group-when-full="false"
              enable-upload />
          </div>
        </template>
        <template v-else-if="item.type == 'number'">
          <n-input-number
            v-model:value="formValue[item.key]"
            :placeholder="tr(item.label)"
            class="w-full" />
        </template>
        <template v-else-if="item.type == 'checkbox'">
          <n-checkbox v-model:checked="formValue[item.key]" class="w-full" />
        </template>
        <template v-else-if="item.type == 'date'">
          <n-date-picker
            v-model:formatted-value="formValue[item.key]"
            value-format="yyyy-MM-dd"
            format="dd MMMM yyyy"
            type="date"
            clearable
            class="w-full" />
        </template>
        <template
          v-else-if="
            item.type == 'single-select' || item.type == 'multi-select'
          ">
          <n-select
            v-model:value="formValue[item.key]"
            :options="(item.options || [] as any[])"
            :multiple="item.type == 'multi-select'"
            :placeholder="tr(item.label)"
            :render-label="renderSelectLabel"
            value-field="key"
            label-field="label"
            filterable
            clearable
            class="w-full" />
        </template>
      </n-form-item>
    </template>
  </n-form>
</template>

<style scoped lang="scss"></style>

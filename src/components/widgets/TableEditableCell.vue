<script setup lang="ts">
  import { EditOutlined } from '@vicons/material'

  interface Props {
    value: string | number
    onUpdateValue: (value: string | number | null) => void
    placeholder?: string
    disabled?: boolean
    suffix?: string
    type?: 'number' | 'text' | 'textarea'
    size?: 'tiny' | 'small' | 'medium' | 'large'
    autosize?: boolean | { minRows?: number; maxRows?: number }
    clearable?: boolean
    showEditIcon?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    suffix: '',
    type: 'text',
    size: 'medium',
    disabled: false,
    placeholder: undefined,
    autosize: false,
    clearable: false,
    showEditIcon: true,
  })

  const isEdit = ref(false)
  const inputRef = ref<HTMLElement | null>(null)
  const inputValue = ref(
    props.type === 'number'
      ? isNaN(parseFloat(String(props.value)))
        ? ''
        : String(props.value)
      : String(props.value)
  )

  const handleOnClick = () => {
    if (props.disabled) return
    isEdit.value = true
    nextTick(() => {
      if (inputRef.value) inputRef.value.focus()
    })
  }

  const handleChange = () => {
    props.onUpdateValue(
      props.type === 'number'
        ? isNaN(parseFloat(inputValue.value))
          ? null
          : parseFloat(inputValue.value)
        : String(inputValue.value)
    )
    isEdit.value = false
  }

  const onlyAllowNumber = (value: any) =>
    !value || (!isNaN(parseFloat(value)) && isFinite(value))
</script>

<template>
  <div
    :style="`min-height: 24px; width: 100%; ${
      props.disabled ? '' : 'cursor: pointer'
    }`"
    class="flex items-center justify-center"
    @click="handleOnClick">
    <n-input
      v-if="isEdit"
      ref="inputRef"
      v-model:value="inputValue"
      :size="props.size"
      :autosize="props.autosize"
      :clearable="props.clearable"
      :placeholder="props.placeholder"
      :type="props.type === 'textarea' ? 'textarea' : 'text'"
      :allow-input="props.type === 'number' ? onlyAllowNumber : undefined"
      @change="handleChange"
      @blur="handleChange">
      <template #suffix>{{ props.suffix }}</template>
    </n-input>
    <div
      v-else
      :class="{
        'flex items-center justify-center':
          props.showEditIcon && !props.disabled,
      }">
      <span :class="{ 'mr-1': props.showEditIcon && !props.disabled }">{{
        inputValue + (props.suffix ? ` ${props.suffix}` : '')
      }}</span>
      <n-icon
        v-if="props.showEditIcon && !props.disabled"
        :size="12"
        color="dimgray">
        <EditOutlined />
      </n-icon>
    </div>
  </div>
</template>

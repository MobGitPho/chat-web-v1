<script lang="ts">
  export default defineComponent({
    name: 'VueTelInputWrapper',
  })
</script>

<script setup lang="ts">
  interface Props {
    modelValue: string | null
  }

  const props = withDefaults(defineProps<Props>(), {})

  const emits = defineEmits(['update:modelValue'])

  const value = computed({
    get() {
      return props.modelValue ?? ''
    },
    set(val) {
      emits('update:modelValue', val)
    },
  })

  const { t } = useI18n()
  const { pickByTheme } = useHelper()

  const telInputBorderColor = computed(() => pickByTheme('#bbb', '#303033'))

  const telInputBgColor = computed(() => pickByTheme('#fff', '#303033'))

  const telInputTextColor = computed(() => pickByTheme('#444', '#ddd'))

  const telDropdownBorderColor = computed(() => pickByTheme('#ccc', '#303033'))

  const telDropdownBgColor = computed(() => pickByTheme('#fff', '#303033'))

  const telDropdownItemHoverColor = computed(() =>
    pickByTheme('#f3f3f3', 'black')
  )

  const phoneInputOptions = {
    required: true,
    autofocus: true,
    showDialCode: true,
    validCharactersOnly: true,
    placeholder: t('phoneNumber'),
    invalidMsg: t('invalidNumber'),
    mode: 'auto',
  }
  const phoneDropdownOptions = {
    showSearchBox: true,
    showFlags: true,
  }
</script>

<template>
  <vue-tel-input
    v-model="value"
    class="w-full"
    :input-options="phoneInputOptions"
    :dropdown-options="phoneDropdownOptions" />
</template>

<style scoped>
  ::v-deep(.vti__input) {
    background: v-bind(telInputBgColor);
    color: v-bind(telInputTextColor);
  }

  .vue-tel-input {
    border: 1px solid v-bind(telInputBorderColor) !important;
  }

  ::v-deep(.vti__dropdown-list) {
    border: 1px solid v-bind(telDropdownBorderColor);
    background: v-bind(telDropdownBgColor);
  }

  ::v-deep(.vti__dropdown-item.highlighted) {
    background: v-bind(telDropdownItemHoverColor);
  }
</style>

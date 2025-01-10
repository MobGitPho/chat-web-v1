<script lang="ts">
  export default defineComponent({
    name: 'NFormFieldMapper',
  })
</script>

<script setup lang="ts">
  import { FieldType, Item, ItemOption } from './helper'

  interface Props {
    modelValue: Item[] | string
    useJson?: boolean
    useI18n?: boolean
    keyGenerationMode?: 'auto' | 'manual'
    showSortButton?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    useJson: false,
    useI18n: true,
    keyGenerationMode: 'auto',
    showSortButton: false,
  })

  const emits = defineEmits(['update:modelValue', 'validate'])

  const { t } = useI18n()

  const fieldTypes: FieldType[] = [
    {
      label: t('text'),
      value: 'text',
    },
    {
      label: t('longText'),
      value: 'textarea',
    },
    {
      label: t('number'),
      value: 'number',
    },
    {
      label: t('checkbox'),
      value: 'checkbox',
    },
    {
      label: t('singleSelect'),
      value: 'single-select',
    },
    {
      label: t('multiSelect'),
      value: 'multi-select',
    },
    {
      label: t('date'),
      value: 'date',
    },
    {
      label: t('textEditor'),
      value: 'editor',
    },
  ]

  const onCreateDataFormItem = (index: number): Item => ({
    key: `field_${index + 1}`,
    label: '',
    type: 'text',
    required: false,
  })

  const onCreateDataFormItemOption = (
    index: number,
    itemIndex: number
  ): ItemOption => ({
    key: `option_${itemIndex + 1}${index + 1}`,
    label: '',
  })

  let modelValueProp: Item[] = []

  if (props.useJson) {
    try {
      modelValueProp = JSON.parse(props.modelValue as string)
    } catch (e) {
      modelValueProp = []
    }
  }

  const items = ref<Item[]>(
    props.useJson ? modelValueProp : (props.modelValue as Item[])
  )

  const checkValidity = () => {
    if (!items.value.length) return false

    for (const item of items.value) {
      if (!item.key || !item.label || !item.type) return false
      if (item.options && Array.isArray(item.options)) {
        for (const option of item.options) {
          if (!option.key || !option.label) return false
        }
      }
    }

    return true
  }

  watch(
    () => items.value,
    (value) => {
      if (props.useJson) {
        emits('update:modelValue', JSON.stringify(value))
      } else emits('update:modelValue', value)

      emits('validate', checkValidity())
    },
    {
      immediate: true,
      deep: true,
    }
  )

  const keyFormatter = (value: string) => {
    const regex = /^[a-z0-9_]+$/
    return regex.test(value)
  }
</script>

<template>
  <section>
    <n-dynamic-input
      v-model:value="items"
      :placeholder="t('addField')"
      :on-create="onCreateDataFormItem"
      :show-sort-button="props.showSortButton"
      class="w-full">
      <template #create-button-default>
        {{ t('addField') }}
      </template>
      <template #default="{ value, index: itemIndex }">
        <div class="flex flex-col w-full">
          <div class="w-full flex items-center">
            <n-input
              v-if="props.keyGenerationMode === 'manual'"
              v-model:value="value.key"
              :allow-input="keyFormatter"
              :placeholder="t('fieldKey')"
              style="margin-right: 1%; width: 20%"
              type="text" />
            <I18nInput
              v-if="props.useI18n"
              v-model="value.label"
              :placeholder="t('fieldTitle')"
              :selector-span="6"
              :style="`margin-right: 1%; width: ${
                props.keyGenerationMode === 'manual' ? '38%' : '100%'
              }`"
              sync />
            <n-input
              v-else
              v-model:value="value.label"
              :placeholder="t('fieldTitle')"
              :style="`margin-right: 1%; width: ${
                props.keyGenerationMode === 'manual' ? '38%' : '100%'
              }`" />
            <n-select
              v-model:value="value.type"
              :options="(fieldTypes as any[])"
              value-field="value"
              label-field="label"
              :placeholder="t('fieldType')"
              :style="`margin-right: 1%; width: ${
                props.keyGenerationMode === 'manual' ? '20%' : '30%'
              }`" />
            <n-checkbox
              v-model:checked="value.required"
              :style="`width: ${
                props.keyGenerationMode === 'manual' ? '18%' : '30%'
              }`">
              {{ t('fieldRequired') }}
            </n-checkbox>
          </div>
          <CustomTransition name="slide-fade" appear>
            <div
              v-if="
                value.type === 'multi-select' || value.type === 'single-select'
              "
              class="w-full flex items-center mt-4">
              <n-dynamic-input
                v-model:value="value.options"
                :placeholder="t('addOption')"
                :on-create="(index: number) => onCreateDataFormItemOption(index, itemIndex)"
                :show-sort-button="props.showSortButton"
                class="w-full">
                <template #create-button-default>
                  {{ t('addOption') }}
                </template>
                <template #default="{ value: optionValue }">
                  <div class="w-full flex items-center">
                    <n-input
                      v-if="props.keyGenerationMode === 'manual'"
                      v-model:value="optionValue.key"
                      :allow-input="keyFormatter"
                      :placeholder="t('optionKey')"
                      style="margin-right: 1%; width: 30%"
                      type="text" />
                    <I18nInput
                      v-if="props.useI18n"
                      v-model="optionValue.label"
                      :placeholder="t('optionText')"
                      :selector-span="4"
                      class="w-full"
                      sync />
                    <n-input
                      v-else
                      v-model:value="optionValue.label"
                      :placeholder="t('optionText')"
                      class="w-full" />
                  </div>
                </template>
              </n-dynamic-input>
            </div>
          </CustomTransition>
          <n-divider></n-divider>
        </div>
      </template>
    </n-dynamic-input>
  </section>
</template>

<style scoped lang="scss"></style>

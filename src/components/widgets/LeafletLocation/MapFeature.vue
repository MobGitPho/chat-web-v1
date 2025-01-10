<script setup lang="ts">
  import { MyLocationTwotone } from '@vicons/material'

  import { SelectOption } from 'naive-ui'

  const emits = defineEmits(['selectCoords', 'getGeoLocation'])

  const { t } = useI18n()

  const searchValue = ref<string | null>(null)
  const isProceeding = ref<boolean>(false)
  const placesOptions = ref<SelectOption[]>([])

  const handleSearch = async (query: string) => {
    try {
      if (!query.length) {
        placesOptions.value = []
        return
      }

      isProceeding.value = true

      const api = `https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=${encodeURI(
        query
      )}`

      const response = await fetch(api)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()

      placesOptions.value = data.map((feature: any) => ({
        coords: {
          lat: feature.lat,
          lng: feature.lon,
        },
        value: feature.place_id,
        label: feature.display_name,
      }))

      isProceeding.value = false
    } catch (error) {
      console.error(error)
      isProceeding.value = false
    }
  }

  const handleUpdateValue = (value: string, option: SelectOption) => {
    emits('selectCoords', option.coords)
  }
</script>

<template>
  <div class="flex justify-between">
    <n-select
      v-model:value.lazy="searchValue"
      filterable
      :placeholder="t('searchPlaces')"
      :options="placesOptions"
      :loading="isProceeding"
      clearable
      remote
      class="relative !w-2/3"
      @search="handleSearch"
      @update:value="handleUpdateValue" />

    <n-button @click="emits('getGeoLocation')">
      <template #icon>
        <n-icon :component="MyLocationTwotone" />
      </template>
    </n-button>
  </div>
</template>

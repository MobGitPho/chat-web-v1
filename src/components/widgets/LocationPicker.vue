<script setup lang="ts">
  import { GOOGLE_MAPS_DEFAULT_LOCATION, Location } from '@/utils/constants'

  import { LocationOnFilled } from '@vicons/material'

  interface Props {
    location?: Location
    gMapOptions?: object
    gMapStyles?: object
    gMapType?: string
    clickable?: boolean
    draggable?: boolean
    zoom?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    location: () => GOOGLE_MAPS_DEFAULT_LOCATION,
    gMapOptions: () => ({
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: true,
    }),
    gMapStyles: () => ({
      width: '100%',
      height: '400px',
    }),
    gMapType: 'terrain',
    clickable: true,
    draggable: true,
    zoom: 14,
  })

  const emits = defineEmits(['update'])

  const { t } = useI18n()
  const message = useMessage()

  const showGMapInfo = ref(false)
  const locationCountry = ref('')
  const locationCity = ref('')
  const location = ref(props.location)
  const gMapInfoTxt = ref<HTMLElement | null>(null)

  const setCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position.coords) {
            location.value.lat = position.coords.latitude
            location.value.lng = position.coords.longitude
          }
        },
        (error) => {
          console.log(error)

          message.error(t('unableToGetCurrentLocation'))
        },
        { maximumAge: 60000, timeout: 10000, enableHighAccuracy: true }
      )
    } else {
      message.error(t('unableToGetCurrentLocation'))
    }
  }

  const updateLocation = (event: any, src: string) => {
    if (src === 'search') {
      location.value.lat = event.geometry.location.lat()
      location.value.lng = event.geometry.location.lng()

      if (gMapInfoTxt.value)
        gMapInfoTxt.value.textContent = event.formatted_address

      const parts = event.formatted_address.split(',')

      if (parts.length > 1) {
        locationCity.value = parts[0].trim()
        locationCountry.value = parts[1].trim()
      }

      showGMapInfo.value = true
      setTimeout(() => {
        showGMapInfo.value = false
      }, 3000)
    } else {
      location.value.lat = event.latLng.lat()
      location.value.lng = event.latLng.lng()

      locationCountry.value = ''
      locationCity.value = ''
    }

    emits('update', location.value, locationCountry.value, locationCity.value)
  }
</script>

<template>
  <section style="width: 100%">
    <div class="location-picker-header">
      <n-button size="small" @click="setCurrentLocation()">
        <template #icon>
          <n-icon>
            <LocationOnFilled />
          </n-icon>
        </template>
        {{ t('currentLocation') }}
      </n-button>
      <div class="search-input">
        <GMapAutocomplete
          :placeholder="t('search')"
          @place_changed="updateLocation($event, 'search')">
        </GMapAutocomplete>
      </div>
    </div>
  </section>

  <br />

  <GMapMap
    :zoom="props.zoom"
    :center="location"
    :options="props.gMapOptions"
    :map-type-id="props.gMapType"
    :style="props.gMapStyles">
    <GMapMarker
      :position="location"
      :clickable="props.clickable"
      :draggable="props.draggable"
      @dragend="updateLocation($event, 'drag')">
      <GMapInfoWindow :opened="showGMapInfo">
        <div ref="gMapInfoTxt" style="color: dimgray"></div>
      </GMapInfoWindow>
    </GMapMarker>
  </GMapMap>
</template>

<style scoped>
  .location-picker-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .search-input input {
    border: 0.5px solid dimgray;
  }

  .search-input input:focus-visible {
    border: 1px solid dimgray;
  }
</style>

<style>
  .pac-container {
    z-index: 10000;
  }
</style>

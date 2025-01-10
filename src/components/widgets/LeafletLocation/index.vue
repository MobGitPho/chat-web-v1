<script lang="ts">
  export default defineComponent({
    name: 'LeafletLocation',
  })
</script>

<script setup lang="ts">
  import L from 'leaflet'

  import markerBlue from './images/map-marker-blue.svg'
  import markerRed from './images/map-marker-red.svg'
  import './plugins/fullscreen/Control.FullScreen.css'
  import './plugins/fullscreen/Control.FullScreen.js'

  type Coords = { lat: number; lng: number }

  interface Props {
    coordToHighLight?: Coords | null
    dataList?: Coords[]
    showFeature?: boolean
    height?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    coordToHighLight: null,
    dataList: () => [],
    showFeature: true,
    height: 300,
  })
  const emits = defineEmits([
    'update:coords',
    'stepAction',
    'markerClick',
    'update:coordToHighLight',
  ])
  const message = useMessage()
  const { t } = useI18n()

  const fetchCoords = ref(false)
  const geoMarker = ref<L.Marker | null>(null)
  const mapContainer = ref<HTMLElement | null>(null)
  const map = ref<L.Map | null>(null)

  const plotGeolocation = (newCoords: Coords) => {
    if (geoMarker.value) {
      // @ts-ignore
      map.value?.removeLayer(geoMarker.value)
    }

    const customMarker = L.icon({
      iconUrl: markerRed,
      iconSize: [35, 35],
    })

    geoMarker.value = L.marker([newCoords.lat, newCoords.lng], {
      icon: customMarker,
      draggable: true,
    })
      .addTo(map.value as L.Map)
      .on('dragend', (event: any) => {
        const latLng = event.target.getLatLng()
        const coords = { lat: latLng.lat, lng: latLng.lng }
        emits('update:coords', coords)
      })

    map.value?.flyTo([newCoords.lat, newCoords.lng], 16)
    emits('update:coords', newCoords)
  }

  const getGeolocation = () => {
    fetchCoords.value = true
    if (navigator.geolocation && fetchCoords.value) {
      navigator.geolocation.watchPosition(setCoords, getLocError)
    }
  }

  const setCoords = (pos: any) => {
    fetchCoords.value = false
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
    plotGeolocation(coords)
  }

  const getLocError = (err: any) => {
    fetchCoords.value = false
    message.error(t('anErrorOccuredDuringLocalisationFetch'))
  }

  const getCenter = (coords: Coords[]) => {
    if (coords.length == 0) {
      return null
    }

    let totalLat = 0
    let totalLng = 0

    for (const coord of coords) {
      totalLat += coord.lat
      totalLng += coord.lng
    }

    const avgLat = totalLat / coords.length
    const avgLng = totalLng / coords.length

    return { lat: avgLat, lng: avgLng }
  }

  const displayListMarker = () => {
    if (props.dataList) {
      const customMarker = L.icon({
        iconUrl: markerBlue,
        iconSize: [35, 35],
      })

      L.circle({ lat: 6.1316, lng: 1.224 }, 5)

      props.dataList.forEach((data) => {
        L.marker([data.lat, data.lng], { icon: customMarker })
          .addTo(map.value as L.Map)
          .on('click', function (e) {
            emits('markerClick', e.latlng)
          })
          .on('mouseover', function (e) {
            //
          })
      })
      const center = getCenter(props.dataList)
      map.value?.flyTo([center?.lat || 0, center?.lng || 0], 12)
    }
  }

  onMounted(() => {
    if (mapContainer.value) {
      map.value = L.map(mapContainer.value as HTMLElement, {
        // @ts-ignore
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: 'topleft',
        },
      }).setView([6.136629, 1.222186], 10)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map.value as L.Map)

      displayListMarker()

      if (props.coordToHighLight) plotGeolocation(props.coordToHighLight)
    }
  })

  watch(
    () => props.dataList,
    () => {
      displayListMarker()
    },
    {
      deep: true,
    }
  )

  watch(
    () => props.coordToHighLight,
    (nv) => {
      if (nv) plotGeolocation(nv)
    },
    {
      deep: true,
    }
  )
</script>

<template>
  <div class="relative">
    <MapFeature
      v-if="props.showFeature"
      @select-coords="plotGeolocation"
      @get-geo-location="getGeolocation" />
    <div
      ref="mapContainer"
      class="z-[1] mt-3"
      :style="{
        height:
          typeof props.height == 'number' ? `${props.height}px` : props.height,
      }" />
  </div>
</template>

import Shepherd from 'shepherd.js'

declare module 'vue-shepherd' {
  export function useShepherd(
    ...args: Array<Shepherd.Tour.TourOptions>
  ): Shepherd.Tour
}

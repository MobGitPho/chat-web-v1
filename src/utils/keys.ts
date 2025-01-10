import { InjectionKey } from 'vue'

// keys.js
export const contentKey = Symbol() as InjectionKey<{
  contentLayout: any
}>

import { UserPrefs } from '@/utils/types'

import { Bool } from '@/enums/bool'

export const useUserPreference = () => {
  const { locale } = useI18n()

  const defaultPrefs = ref<UserPrefs>({
    inAppNotifEnabled: Bool.TRUE,
    emailNotifEnabled: Bool.TRUE,
    locale: locale.value,
  })

  return {
    defaultPrefs,
  }
}

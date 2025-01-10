import { Bool } from '@/enums/bool'

export interface UserPrefs {
  inAppNotifEnabled?: Bool
  emailNotifEnabled?: Bool
  locale?: string
}

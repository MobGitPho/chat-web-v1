<script lang="ts">
  export default defineComponent({
    name: Routes.ACCOUNT.NAME,
  })
</script>

<script setup lang="ts">
  import {
    compressImage,
    dataUrlToFile,
    getNameInitials,
  } from '@/utils/functions'
  import passwordStrengthOptions from '@/utils/password-strength-options'

  import { UserModel } from '@/models/user'

  import {
    DeleteFilled,
    EditFilled,
    EmailFilled,
    PasswordFilled,
    ImageFilled,
    SaveFilled,
  } from '@vicons/material'

  import { WindowRestore } from '@vicons/fa'

  import {
    FormInst,
    FormItemRule,
    FormRules,
    FormValidationError,
  } from 'naive-ui'

  import { passwordStrength } from 'check-password-strength'

  import Preferences from './Preferences.vue'

  import Routes from '@/router/routes'

  import { isValidPhoneNumber } from 'libphonenumber-js'

  import Admin from './InfoPortal/Admin.vue'
  import { AuthType } from '@/enums/auth-type'
  import { ProfileType } from '@/enums/profile-type'
  import { ResponseErrorCode } from '@/enums/response-error-code'

  interface UserFormValue {
    lastname: string | null
    firstname: string | null
    email: string | null
    avatar: string | null
    phone: string | null
  }

  const { t } = useI18n()
  const { request } = useApi()
  const { pickByTheme, fileUrl, displayFormErrors } = useHelper()

  const message = useMessage()
  const loadingBar = useLoadingBar()

  const isProceeding = ref<boolean>(false)
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<UserFormValue & { phone: string }>({
    lastname: '',
    firstname: '',
    email: '',
    avatar: '',
    phone: '',
  })
  const rules = computed<FormRules>(() => ({
    lastname: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    firstname: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    email: [
      {
        required: authStore.userData
          ? authStore.userData.authType != AuthType.PHONE
          : true,
        message: t('fillRequired'),
      },
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (value && !_v.isEmail(value)) {
            return new Error(t('invalidEmail'))
          }

          return true
        },
      },
    ],
    phone: [
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (value && !isValidPhoneNumber(value)) {
            return new Error(t('invalidNumber'))
          }

          return true
        },
      },
    ],
  }))

  const authStore = useAuthStore()

  const saveBtnDisabled = computed(() => {
    return (
      authStore.userData?.lastname === formValue.value.lastname &&
      authStore.userData?.firstname === formValue.value.firstname &&
      authStore.userData?.avatar === formValue.value.avatar &&
      (authStore.userData?.phone === formValue.value.phone ||
        !formValue.value.phone)
    )
  })

  const submit = async (e: MouseEvent) => {
    e.preventDefault()

    isProceeding.value = true

    formRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          const task = await request({
            url: `/users/self/${authStore.userData?.id}`,
            method: 'put',
            data: {
              lastname: formValue.value.lastname,
              firstname: formValue.value.firstname,
              avatar: formValue.value.avatar,
              phone: formValue.value.phone,
            } as UserModel,
          })

          if (task.success) {
            authStore.userData = task.result.data

            init()

            message.success(t('success'))
          } else {
            message.error(t('anErrorOccured'))
          }
        }
      }
    )

    isProceeding.value = false
  }

  const init = async () => {
    loadingBar.start()
    isProceeding.value = true

    const task = await request({
      url: `/users/${authStore.userData?.id}`,
    })

    if (task.success && task.result) {
      formValue.value = {
        lastname: task.result.data.lastname,
        firstname: task.result.data.firstname,
        email: task.result.data.email,
        avatar: task.result.data.avatar,
        phone: task.result.data.phone,
      }
    }

    isProceeding.value = false
    loadingBar.finish()
  }

  init()

  // AVATAR

  const folder = 'avatars'
  const pickerVisible = ref(false)

  const saveAvatar = async (result: unknown, dataUrl: string) => {
    isProceeding.value = true

    var file = dataUrlToFile(dataUrl)
    file = await compressImage(file, { maxSizeMB: 1 })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const task = await request({
      url: '/file/upload',
      method: 'post',
      data: formData,
    })

    if (task.success && task.result) {
      formValue.value.avatar = task.result.data.path
      pickerVisible.value = false
    } else message.error(t('anErrorOccured'))

    isProceeding.value = false
  }

  const clearAvatar = () => {
    formValue.value.avatar = ''
  }

  // PASSWORD EDITION PART

  interface EditPwdFormValue {
    newPassword: string | null
    newPasswordConfirmation: string | null
    currentPassword: string | null
  }

  const editPwdVisible = ref(false)
  const isPwdProceeding = ref(false)
  const pwdFormRef = ref<FormInst | null>(null)
  const pwdFormValue = ref<EditPwdFormValue>({
    newPassword: '',
    newPasswordConfirmation: '',
    currentPassword: '',
  })
  const pwdRules: FormRules = {
    newPassword: [
      {
        required: true,
        message: t('fillRequired'),
      },
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (
            value &&
            ['too-weak'].includes(
              passwordStrength(value, passwordStrengthOptions as any).value
            )
          ) {
            return new Error(t('passwordTooWeak'))
          }

          return true
        },
      },
    ],
    newPasswordConfirmation: [
      {
        required: true,
        message: t('fillRequired'),
      },
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (value && value !== pwdFormValue.value.newPassword) {
            return new Error(t('nonCompliantPassword'))
          }

          return true
        },
      },
    ],
    currentPassword: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
  }

  const editPassword = async () => {
    pwdFormRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          loadingBar.start()
          isPwdProceeding.value = true

          const task = await request({
            url: `/auth/edit-password`,
            method: 'post',
            data: {
              newPassword: pwdFormValue.value.newPassword,
              newPasswordConfirmation:
                pwdFormValue.value.newPasswordConfirmation,
              currentPassword: pwdFormValue.value.currentPassword,
            },
          })

          isPwdProceeding.value = false
          loadingBar.finish()

          if (task.failure && task.error) {
            switch (task.error?.response?.data?.errorCode) {
              case ResponseErrorCode.FORM_INVALID_DATA:
                displayFormErrors(task.error?.response?.data?.data)
                break
              case ResponseErrorCode.AUTH_WRONG_PASSWORD:
                message.error(t('wrongPassword'))
                break
              default:
                message.error(t('anErrorOccured'))
            }
          } else {
            message.success(t('passwordResetSuccess'), {
              closable: true,
              duration: 5000,
            })

            pwdFormValue.value = {
              newPassword: '',
              newPasswordConfirmation: '',
              currentPassword: '',
            }

            editPwdVisible.value = false
          }
        }
      }
    )

    return false
  }

  // EMAIL EDITION

  interface EditEmailFormValue {
    email: string | null
  }

  const editEmailVisible = ref(false)
  const isEmailProceeding = ref(false)
  const emailFormRef = ref<FormInst | null>(null)
  const emailFormValue = ref<EditEmailFormValue>({
    email: '',
  })
  const emailRules: FormRules = {
    email: [
      {
        required: true,
        message: t('fillRequired'),
      },
      {
        trigger: ['input'],
        validator(rule: FormItemRule, value: string) {
          if (value && !_v.isEmail(value)) {
            return new Error(t('invalidEmail'))
          }

          return true
        },
      },
    ],
  }

  const editEmail = async () => {
    emailFormRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          loadingBar.start()
          isEmailProceeding.value = true

          const task = await request({
            url: `/auth/edit-email`,
            method: 'post',
            data: {
              email: emailFormValue.value.email,
            },
          })

          isEmailProceeding.value = false
          loadingBar.finish()

          if (task.failure && task.error) {
            switch (task.error?.response?.data?.errorCode) {
              case ResponseErrorCode.FORM_INVALID_DATA:
                displayFormErrors(task.error?.response?.data?.data)
                break
              default:
                message.error(t('anErrorOccured'))
            }
          } else {
            message.success(t('emailResetSuccess'), {
              closable: true,
              duration: 5000,
            })

            if (authStore.userData && emailFormValue.value.email) {
              authStore.userData.email = emailFormValue.value.email
            }

            formValue.value.email = emailFormValue.value.email

            emailFormValue.value = {
              email: '',
            }

            editEmailVisible.value = false
          }
        }
      }
    )

    return false
  }

  // Profile info

  const profileInfoVisible = ref(false)

  const closeProfileInfo = () => {
    profileInfoVisible.value = false

    init()
  }
</script>

<template>
  <PageLayout>
    <template #header-extra>
      <n-space>
        <n-button v-show="false" @click="editEmailVisible = true">
          <template #icon>
            <n-icon>
              <EmailFilled />
            </n-icon>
          </template>
          {{ t('editEmail') }}
        </n-button>
        <n-button v-show="false" @click="editPwdVisible = true">
          <template #icon>
            <n-icon>
              <PasswordFilled />
            </n-icon>
          </template>
          {{ t('editPassword') }}
        </n-button>
        <n-button
          :loading="isProceeding"
          :disabled="saveBtnDisabled"
          type="primary"
          @click="submit">
          <template #icon>
            <n-icon><SaveFilled /></n-icon>
          </template>
          {{ t('save') }}</n-button
        >
      </n-space>
    </template>
    <n-card hoverable embedded>
      <n-grid cols="1 s:2 m:2 l:2 xl:2 2xl:2" responsive="screen">
        <n-gi class="text-center">
          <n-space
            align="center"
            justify="center"
            style="height: 100%"
            vertical>
            <n-avatar
              v-if="formValue.avatar"
              class="cursor-pointer"
              :style="'border: 1px dashed ' + pickByTheme('green', 'white')"
              :size="125"
              :src="fileUrl(formValue.avatar)"
              @click="pickerVisible = true">
            </n-avatar>
            <n-avatar
              v-else
              class="cursor-pointer"
              :style="'border: 1px dashed ' + pickByTheme('green', 'white')"
              :size="125"
              @click="pickerVisible = true">
              <span v-if="authStore.userData?.fullname" class="text-6xl">{{
                getNameInitials(authStore.userData?.fullname || '')
              }}</span>
              <n-icon v-else :size="64">
                <ImageFilled />
              </n-icon>
            </n-avatar>
            <n-button v-if="formValue.avatar" quaternary @click="clearAvatar()">
              <template #icon>
                <n-icon>
                  <DeleteFilled />
                </n-icon>
              </template>
              {{ t('clear') }}
            </n-button>
          </n-space>
        </n-gi>
        <n-gi>
          <n-form
            ref="formRef"
            :model="formValue"
            :rules="rules"
            :show-label="true"
            :show-require-mark="false"
            size="medium">
            <n-grid x-gap="12" :span="24">
              <n-form-item-gi :span="12" :label="t('lastname')" path="lastname">
                <n-input
                  v-model:value="formValue.lastname"
                  :placeholder="t('lastname')"
                  class="w-full" />
              </n-form-item-gi>
              <n-form-item-gi
                :span="12"
                :label="t('firstname_s')"
                path="firstname">
                <n-input
                  v-model:value="formValue.firstname"
                  :placeholder="t('firstname_s')"
                  class="w-full" />
              </n-form-item-gi>
            </n-grid>
            <n-grid x-gap="12" :span="24">
              <n-form-item-gi :span="12" :label="t('phoneNumber')" path="phone">
                <VueTelInputWrapper
                  v-model="formValue.phone"
                  :disabled="authStore.userData?.authType == AuthType.PHONE" />
              </n-form-item-gi>
              <n-form-item-gi
                :span="12"
                :label="t('addressEmail')"
                path="email">
                <n-input-group>
                  <n-input
                    v-model:value="formValue.email"
                    :placeholder="t('addressEmail')"
                    disabled
                    class="w-full" />
                  <n-button
                    type="primary"
                    :loading="isEmailProceeding"
                    @click="editEmailVisible = true">
                    <template #icon>
                      <n-icon>
                        <EditFilled />
                      </n-icon>
                    </template>
                  </n-button>
                </n-input-group>
              </n-form-item-gi>
            </n-grid>
            <n-form-item :label="t('password')" path="password">
              <n-input-group>
                <n-input
                  value="password"
                  :placeholder="t('password')"
                  type="password"
                  disabled
                  class="w-full" />
                <n-button
                  type="primary"
                  :loading="isPwdProceeding"
                  @click="editPwdVisible = true">
                  <template #icon>
                    <n-icon>
                      <EditFilled />
                    </n-icon>
                  </template>
                </n-button>
              </n-input-group>
            </n-form-item>
            <n-input-group>
              <n-input-group-label :style="{ width: '30%' }">
                <span class="text-gray-500">
                  {{ t('roles') }}
                </span>
              </n-input-group-label>
              <n-input-group-label :style="{ width: '70%' }">
                <n-tag
                  v-for="role in authStore.userData?.roles || []"
                  :key="role.name"
                  class="mx-1"
                  size="small"
                  type="info"
                  :round="false"
                  :bordered="false"
                  strong>
                  {{ role.displayName }}
                </n-tag>
              </n-input-group-label>
            </n-input-group>
          </n-form>
        </n-gi>
      </n-grid>
    </n-card>
    <n-divider dashed></n-divider>
    <n-page-header class="mb-5">
      <template #title>
        {{ t('profileInfo') }}
      </template>
      <template #extra>
        <n-space>
          <n-button type="primary" @click="profileInfoVisible = true">
            <template #icon>
              <n-icon><WindowRestore /></n-icon>
            </template>
            {{ t('open') }}
          </n-button>
        </n-space>
      </template>
    </n-page-header>
    <n-divider dashed></n-divider>
    <Preferences />
  </PageLayout>
  <n-modal
    v-model:show="pickerVisible"
    preset="card"
    style="width: 650px"
    :bordered="false"
    :mask-closable="false"
    :close-on-esc="false">
    <ImagePicker
      :cropper-ratio="undefined"
      :round-preview="true"
      :is-loading="isProceeding"
      @cancel="pickerVisible = false"
      @save="saveAvatar" />
  </n-modal>
  <n-modal
    v-model:show="editPwdVisible"
    preset="dialog"
    style="width: 600px"
    :bordered="false"
    :show-icon="false"
    :mask-closable="false"
    :title="t('editPassword')"
    :positive-text="t('validate')"
    :negative-text="t('cancel')"
    @positive-click="editPassword"
    @negative-click="editPwdVisible = false">
    <n-form
      ref="pwdFormRef"
      :model="pwdFormValue"
      :rules="pwdRules"
      :show-require-mark="false"
      size="medium">
      <n-form-item :label="t('newPassword')" path="newPassword">
        <n-input
          v-model:value="pwdFormValue.newPassword"
          :placeholder="t('newPassword')"
          show-password-on="mousedown"
          type="password"
          class="w-full" />
      </n-form-item>
      <n-form-item :label="t('confirmPassword')" path="newPasswordConfirmation">
        <n-input
          v-model:value="pwdFormValue.newPasswordConfirmation"
          :placeholder="t('confirmPassword')"
          :disabled="!pwdFormValue.newPassword"
          show-password-on="mousedown"
          type="password"
          class="w-full" />
      </n-form-item>
      <n-form-item :label="t('currentPassword')" path="currentPassword">
        <n-input
          v-model:value="pwdFormValue.currentPassword"
          :placeholder="t('currentPassword')"
          show-password-on="mousedown"
          type="password"
          class="w-full" />
      </n-form-item>
    </n-form>
  </n-modal>
  <n-modal
    v-model:show="editEmailVisible"
    preset="dialog"
    style="width: 400px"
    :bordered="false"
    :show-icon="false"
    :mask-closable="false"
    :title="t('editEmail')"
    :positive-text="t('validate')"
    :negative-text="t('cancel')"
    @positive-click="editEmail"
    @negative-click="editEmailVisible = false">
    <n-form
      ref="emailFormRef"
      :model="emailFormValue"
      :rules="emailRules"
      :show-require-mark="false"
      size="medium">
      <n-form-item :label="t('emailAddress')" path="email">
        <n-input
          v-model:value="emailFormValue.email"
          :placeholder="t('addressEmail')"
          class="w-full" />
      </n-form-item>
    </n-form>
  </n-modal>
  <n-modal
    v-model:show="profileInfoVisible"
    :loading="isProceeding"
    preset="dialog"
    style="width: 600px"
    :bordered="false"
    :show-icon="false"
    :mask-closable="false"
    :title="t('profileInfo')">
    <Admin
      v-if="authStore.userData?.profileType == ProfileType.ADMIN"
      mode="edition"
      :initial-data="authStore.userData?.profile"
      @back="closeProfileInfo()" />
  </n-modal>
</template>

<style scoped></style>

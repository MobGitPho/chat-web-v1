<script lang="ts">
export default defineComponent({
  name: Routes.USERS_MANAGEMENT.NAME,
})
</script>

<script setup lang="ts">
import { reformatDate } from '@/utils/chronos'

import {
  compressImage,
  dataUrlToFile,
  genPassword,
  getNameInitials,
} from '@/utils/functions'

import Routes from '@/router/routes'

import { UserModel } from '@/models/user'

import { UserPrefs } from '@/utils/types'

import {
  DeleteFilled,
  EditFilled,
  PlusFilled,
  SearchFilled,
  SettingsFilled,
  ImageFilled,
} from '@vicons/material'

import {
  FormInst,
  FormItemRule,
  FormRules,
  FormValidationError,
  NAvatar,
  NButton,
  NIcon,
  NInput,
  NInputGroup,
  NTag,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AccountStatus } from '@/enums/account-status'
import { ProfileType } from '@/enums/profile-type'
import { AuthType } from '@/enums/auth-type'

import { RoleModel } from '@/models/role'
import { ResponseErrorCode } from '@/enums/response-error-code'
import { UserRole } from '@/enums/user-role'

import Groups from './groups.vue'

const loadingBar = useLoadingBar()
const message = useMessage()
const dialog = useDialog()

const { pickByTheme, fileUrl, displayFormErrors } = useHelper()
const { profileTypes, getProfileTypeLabel } = useProfileType()
const { defaultPrefs } = useUserPreference()
const { userIsAbleTo } = useAccess()
const { request } = useApi()

const { t, locale } = useI18n()

const authStore = useAuthStore()
const accessStore = useAccessStore()

const { roles, groups } = storeToRefs(accessStore)


interface Extra {
  no?: number
}

const search = ref<string>('')
const searchInputRef = ref()
const tableData = ref<(UserModel & Extra)[]>([])
const isLoading = ref(false)
const userPrefsDialog = ref(false)
const userPrefsId = ref<number>(0)
const userPrefs = ref<UserPrefs>(defaultPrefs.value)
const columns = computed<DataTableColumns<UserModel & Extra>>(() => [
  {
    title: t('n_'),
    key: 'no',
    width: 50,
    fixed: 'left',
  },
  {
    title: t('avatar'),
    key: 'avatar',
    width: 75,
    fixed: 'left',
    render(row: UserModel & Extra) {
      return row.avatar
        ? h(NAvatar, {
          size: 'medium',
          src: row.avatarUrl,
        })
        : h(
          NAvatar,
          {
            size: 'medium',
            style: { width: '36px', height: '36px', display: 'block' },
          },
          {
            default: () => getNameInitials(row.fullname),
          }
        )
    },
  },
  {
    title: t('lastnameAndFirstname_s'),
    key: 'name',
    resizable: true,
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    fixed: 'left',
    sortOrder: false,
    sorter: 'default',
    render(row: UserModel & Extra) {
      return h(
        'div',
        {},
        {
          default: () => row.fullname,
        }
      )
    },
  },
  {
    title: t('type'),
    key: 'type',
    resizable: true,
    width: 125,
    render(row: UserModel & Extra) {
      return h(
        'div',
        {},
        {
          default: () => getProfileTypeLabel(row.profileType),
        }
      )
    },
    defaultFilterOptionValues: [],
    filterOptions: profileTypes,
    filter: (value, row) => row.profileType == value,
  },
  {
    title: t('roles'),
    key: 'roles',
    resizable: true,
    width: 150,
    render(row: UserModel & Extra) {
      return h(
        'div',
        {},
        {
          default: () => {
            const roles = row.roles?.map((item: RoleModel) => {
              return h(
                NTag,
                {
                  class: 'mx-1 my-1',
                  size: 'small',
                  type: 'info',
                  round: false,
                  strong: true,
                  bordered: false,
                },
                {
                  default: () => item.displayName,
                }
              )
            })

            return roles
          },
        }
      )
    },
    defaultFilterOptionValues: [],
    filterOptions: roles.value.map((role) => ({
      label: role.displayName,
      value: role.name,
    })),
    filter: (value, row) =>
      row.roles?.map((item) => item.name)?.includes(String(value)) || false,
  },
  {
    title: t('email'),
    key: 'email',
    resizable: true,
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: t('phoneNumber'),
    key: 'phone',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: t('status'),
    key: 'accountStatus',
    width: 125,
    render(row: UserModel & Extra) {
      return h(
        NTag,
        {
          type:
            row.accountStatus == AccountStatus.ENABLED
              ? 'success'
              : row.accountStatus == AccountStatus.DISABLED
                ? 'error'
                : 'warning',
          bordered: false,
        },
        {
          default: () =>
            row.accountStatus == AccountStatus.ENABLED
              ? t('activated')
              : row.accountStatus == AccountStatus.DISABLED
                ? t('deactivated')
                : t('undefined'),
        }
      )
    },
    sortOrder: false,
    sorter: 'default',
  },
  {
    title: t('lastLogin'),
    key: 'lastLoggedInAt',
    width: 125,
    render(row: UserModel & Extra) {
      return h(
        'div',
        {},
        {
          default: () =>
            reformatDate(row.lastLoggedInAt || '', { locale: locale.value }),
        }
      )
    },
  },
  {
    title: t('lastEdition'),
    key: 'updatedAt',
    width: 125,
    render(row: UserModel & Extra) {
      return h(
        'div',
        {},
        {
          default: () =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            reformatDate(row.updatedAt!, { locale: locale.value }),
        }
      )
    },
  },
  {
    title: t('creation'),
    key: 'createdAt',
    width: 125,
    render(row: UserModel & Extra) {
      return h(
        'div',
        {},
        {
          default: () =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            reformatDate(row.createdAt!, { locale: locale.value }),
        }
      )
    },
  },
  {
    title: () => {
      return h(
        NInputGroup,
        {},
        {
          default: () => [
            h(NInput, {
              ref: searchInputRef,
              placeholder: t('search'),
              value: search.value,
              onInput: (value: string) => {
                search.value = value

                if (!search.value) {
                  init(
                    `/users?pageSize=${pageSize.value}&page=${currentPage.value}&query=${search.value}`
                  )
                }

                // if (searchInputRef.value) searchInputRef.value.focus()
              },
              clearable: true,
            }),
            h(
              NButton,
              {
                onClick: () => {
                  init(
                    `/users?pageSize=${pageSize.value}&page=${currentPage.value}&query=${search.value}`
                  )
                },
              },
              {
                default: () =>
                  h(NIcon, {}, { default: () => h(SearchFilled) }),
              }
            ),
          ],
        }
      )
    },
    key: 'actions',
    width: 200,
    render(row: UserModel & Extra) {
      const displayAction = () => {
        return (
          row.id != authStore.userData?.id &&
          !row.roles?.map((role) => role.name)?.includes(UserRole.SUPER_ADMIN)
        )
      }

      const items = []

      if (userIsAbleTo('edit-user') && displayAction()) {
        items.push(
          h(
            NButton,
            {
              size: 'small',
              type: 'warning',
              onClick: () => {
                openFormModal(row)
              },
              renderIcon: () =>
                h(NIcon, null, {
                  default: () => h(EditFilled),
                }),
            },
            { default: () => t('edit') }
          )
        )
        items.push(
          h('div', {
            class: 'w-2',
          })
        )
        items.push(
          h(NButton, {
            size: 'small',
            type: 'success',
            onClick: () => {
              userPrefs.value = (row.preferences ||
                defaultPrefs.value) as UserPrefs
              userPrefsId.value = row.id || 0
              userPrefsDialog.value = true
            },
            renderIcon: () =>
              h(NIcon, null, {
                default: () => h(SettingsFilled),
              }),
          })
        )
      }

      if (userIsAbleTo('delete-user') && displayAction()) {
        items.push(
          h('div', {
            class: 'w-2',
          })
        )
        items.push(
          h(NButton, {
            size: 'small',
            type: 'error',
            onClick: () => {
              dialog.warning({
                title: t('confirm'),
                content: t('confirmDeleteUser'),
                positiveText: t('yes'),
                negativeText: t('no'),
                onPositiveClick: async () => {
                  loadingBar.start()

                  const task = await request({
                    url: `/users/${row.id}`,
                    method: 'delete',
                  })

                  if (task.success) message.success(t('success'))
                  else message.error(t('anErrorOccured'))

                  loadingBar.finish()

                  init(
                    `/users?pageSize=${pageSize.value}&page=${currentPage.value}&query=${search.value}`
                  )
                },
              })
            },
            renderIcon: () =>
              h(NIcon, null, {
                default: () => h(DeleteFilled),
              }),
          })
        )
      }

      return h(
        'div',
        { class: 'flex justify-end items-center w-full' },
        items
      )
    },
    fixed: 'right',
  },
])

// Pagination

const total = ref(0)
const pageSize = ref(6)
const currentPage = ref(1)

const handlePageChange = (value: number) => {
  init(
    `/users?pageSize=${pageSize.value}&page=${value}&query=${search.value}`
  )
}

const handlePageSizeChange = (value: number) => {
  pageSize.value = value
  init(`/users?pageSize=${pageSize.value}&query=${search.value}`)
}

const init = async (url: string | null = null, loadAllData = false) => {
  isLoading.value = true
  loadingBar.start()

  const task = await request({
    url: url
      ? url
      : `/users?pageSize=${pageSize.value}&query=${search.value}`,
  })

  if (task.success && task.result) {
    total.value = task.result.data?.meta?.total || 0
    currentPage.value = task.result.data?.meta?.currentPage || 1

    tableData.value = (task.result.data?.users || []).map(
      (item: UserModel & Extra, i: number) => {
        const cloned = _.cloneDeep(item)

        cloned.no = i + 1 + (currentPage.value - 1) * pageSize.value

        return cloned
      }
    )
  }

  if (loadAllData) {
    accessStore.loadRoles()
    accessStore.loadGroups()
  }
  loadingBar.finish()
  isLoading.value = false
}

init(null, true)

// Add & Edit admin

interface CustomUserModel
  extends Omit<
    UserModel,
    | 'accountStatus'
    | 'password'
    | 'avatarUrl'
    | 'fullname'
    | 'profileId'
    | 'roles'
  > {
  accountStatus: string | AccountStatus
  roles: string[]
}

const isProceeding = ref(false)
const dialogVisible = ref(false)
const GroupsDialogVisible = ref(false)
const sendCredentialsEmail = ref(false)
const currentEditItem = ref<(UserModel & Extra) | null>(null)
const formRef = ref<FormInst | null>(null)
const formValue = ref<CustomUserModel>({
  avatar: '',
  lastname: '',
  firstname: '',
  email: '',
  profileType: ProfileType.ADMIN,
  accountStatus: AccountStatus.DISABLED,
  roles: [],
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
  status: [
    {
      required: true,
      message: t('fillRequired'),
    },
  ],
  profileType: [
    {
      required: true,
      message: t('fillRequired'),
    },
  ],
  email: [
    {
      required: currentEditItem.value
        ? currentEditItem.value.authType != AuthType.PHONE
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
}))

const openFormModal = (item: (UserModel & Extra) | null) => {
  currentEditItem.value = _.cloneDeep(item)

  formValue.value = {
    avatar: item ? item.avatar : '',
    lastname: item ? item.lastname : '',
    firstname: item ? item.firstname : '',
    email: item ? item.email : '',
    profileType: item ? item.profileType : ProfileType.ADMIN,
    accountStatus: item ? item.accountStatus : AccountStatus.DISABLED,
    roles: item ? item.roles?.map((item) => item.name) ?? [] : [],
  }

  dialogVisible.value = true
}

const submit = async () => {
  formRef.value?.validate(
    async (errors: Array<FormValidationError> | undefined) => {
      if (!errors) {
        const password = genPassword(12)

        if (currentEditItem.value) {
          if (
            currentEditItem.value.email !== formValue.value.email &&
            tableData.value.findIndex(
              (d) => d.email == formValue.value.email
            ) > -1
          ) {
            message.error(t('sameEmailMessage'))
          } else {
            loadingBar.start()
            isProceeding.value = true

            const task = await request({
              url: `/users/${currentEditItem.value.id}`,
              method: 'put',
              data: {
                password,
                avatar: formValue.value.avatar,
                lastname: formValue.value.lastname,
                firstname: formValue.value.firstname,
                email: formValue.value.email,
                roles: formValue.value.roles,
                accountStatus: formValue.value.accountStatus,
                sendCredentialsEmail: sendCredentialsEmail.value,
              },
            })

            if (task.success) {
              let profileData

              switch (formValue.value.profileType) {
                case ProfileType.ADMIN:
                  profileData = {}
                  break
              }

              await request({
                url: `/auth/profile/${currentEditItem.value.profile?.id}`,
                method: 'put',
                data: {
                  type: formValue.value.profileType,
                  profileData,
                },
              })

              if (sendCredentialsEmail.value) {
                dialog.success({
                  title: t('success'),
                  content: t('userAccountPasswordReset', [
                    formValue.value.email,
                    password,
                  ]),
                  positiveText: t('ok'),
                })
              } else message.success(t('success'))
            } else message.error(t('anErrorOccured'))

            isProceeding.value = false
            loadingBar.finish()

            init(
              `/users?pageSize=${pageSize.value}&page=${currentPage.value}&query=${search.value}`
            )

            dialogVisible.value = false
          }
        } else {
          if (
            tableData.value.findIndex(
              (d) => d.email == formValue.value.email
            ) > -1
          ) {
            message.error(t('sameEmailMessage'))
          } else {
            loadingBar.start()
            isProceeding.value = true

            const task = await request({
              url: `/users`,
              method: 'post',
              data: {
                password,
                email: formValue.value.email,
                lastname: formValue.value.lastname,
                firstname: formValue.value.firstname,
                avatar: formValue.value.avatar,
                roles: formValue.value.roles,
                accountStatus: formValue.value.accountStatus,
                sendCredentialsEmail: sendCredentialsEmail.value,
                preferences: defaultPrefs.value,
              },
            })

            if (task.failure && task.error) {
              switch (task.error?.response?.data?.errorCode) {
                case ResponseErrorCode.AUTH_MISSING_DATA:
                  message.error(t('missingData'))
                  break
                case ResponseErrorCode.FORM_INVALID_DATA:
                  displayFormErrors(task.error?.response?.data?.data)
                  break
                default:
                  message.error(t('registrationNotSuccessful'))
              }
            } else {
              let profileData

              switch (formValue.value.profileType) {
                case ProfileType.ADMIN:
                  profileData = {}
                  break
              }

              await request({
                url: `/auth/profile`,
                method: 'post',
                data: {
                  type: formValue.value.profileType,
                  id: task.result.data.id,
                  profileData,
                },
              })

              dialog.success({
                title: t('success'),
                content: t('userAccountEmailContent', [
                  formValue.value.email,
                  password,
                ]),
                positiveText: t('ok'),
              })
            }

            isProceeding.value = false
            loadingBar.finish()

            init(
              `/users?pageSize=${pageSize.value}&page=${currentPage.value}&query=${search.value}`
            )

            dialogVisible.value = false
          }
        }
      }
    }
  )

  return false
}

// Edit user settings

const submitUserSettings = async () => {
  loadingBar.start()
  isProceeding.value = true

  const task = await request({
    url: `/users/${userPrefsId.value}`,
    method: 'put',
    data: {
      preferences: userPrefs.value,
    },
  })

  if (task.success && task.result) {
    init(
      `/users?pageSize=${pageSize.value}&page=${currentPage.value}&query=${search.value}`
    )

    message.success(t('success'))
  } else message.error(t('anErrorOccured'))

  isProceeding.value = false
  loadingBar.finish()

  userPrefsDialog.value = false
}

// Avatar

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

// For patch NTabs UI Glitch
const refreshKey = ref(uuidv4())
watch(
  () => [dialogVisible.value],
  () => {
    setTimeout(() => {
      refreshKey.value = uuidv4()
    }, 500)
  }
)
</script>

<template>
  <PageLayout>
    <template #header-extra>
      <n-space>
        <n-button v-if="userIsAbleTo('add-group')" type="primary" @click="GroupsDialogVisible = true">
          <template #icon>
            <n-icon>
              <PlusFilled />
            </n-icon>
          </template>
          {{ t('addGroup') }}
        </n-button>
        <n-button v-if="userIsAbleTo('add-user')" type="primary" @click="openFormModal(null)">
          <template #icon>
            <n-icon>
              <PlusFilled />
            </n-icon>
          </template>
          {{ t('addUser') }}
        </n-button>
      </n-space>
    </template>
    <n-data-table pagination-behavior-on-filter="first" :columns="columns" :data="tableData" :loading="isLoading"
      :single-line="false" :scroll-x="2000" striped />
    <n-pagination v-model:page="currentPage" class="mt-5 justify-end" show-size-picker :page-size="pageSize"
      :page-sizes="[6, 12, 24, 36, 48]" :page-count="Math.ceil(total / pageSize)" @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange" />
  </PageLayout>
  <n-modal v-model:show="pickerVisible" preset="card" style="width: 650px" :bordered="false" :mask-closable="false"
    :close-on-esc="false">
    <ImagePicker :cropper-ratio="undefined" :round-preview="true" :is-loading="isProceeding"
      @cancel="pickerVisible = false" @save="saveAvatar" />
  </n-modal>
  <n-modal v-model:show="dialogVisible" :loading="isProceeding" preset="dialog" style="width: 700px" :bordered="false"
    :show-icon="false" :mask-closable="false" :title="currentEditItem ? t('edit') : t('add')"
    :positive-text="t('validate')" :negative-text="t('cancel')" @positive-click="submit"
    @negative-click="dialogVisible = false">
    <n-grid x-gap="12" y-gap="12" :span="24" item-responsive responsive="screen">
      <n-gi span="24 s:8 m:8 l:8 xl:8 2xl:8" class="text-center">
        <n-space align="center" justify="center" style="height: 100%">
          <n-avatar v-if="formValue.avatar" class="cursor-pointer"
            :style="'border: 1px dashed ' + pickByTheme('green', 'white')" :size="150" :src="fileUrl(formValue.avatar)"
            @click="pickerVisible = true">
          </n-avatar>
          <n-avatar v-else class="cursor-pointer" :style="'border: 1px dashed ' + pickByTheme('green', 'white')"
            :size="150" @click="pickerVisible = true">
            <span v-if="formValue.firstname && formValue.lastname" class="text-6xl">{{
              getNameInitials(`${formValue.firstname} ${formValue.lastname}`)
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
      <n-gi span="24 s:16 m:16 l:16 xl:16 2xl:16">
        <n-form ref="formRef" :model="formValue" :rules="rules" :show-require-mark="false" size="medium">
          <n-grid x-gap="12" :span="24">
            <n-form-item-gi :span="12" :label="t('lastname')" path="lastname">
              <n-input v-model:value="formValue.lastname" :placeholder="t('lastname')" class="w-full" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" :label="t('firstname_s')" path="firstname">
              <n-input v-model:value="formValue.firstname" :placeholder="t('firstname_s')" class="w-full" />
            </n-form-item-gi>
          </n-grid>
          <n-form-item :label="t('addressEmail')" path="email">
            <n-input v-model:value="formValue.email" :disabled="currentEditItem != null"
              :placeholder="t('addressEmail')" class="w-full" />
          </n-form-item>
          <n-form-item :label="t('type')" path="type">
            <n-select v-model:value="formValue.profileType" :options="profileTypes" :placeholder="t('type')"
              placement="bottom" filterable class="w-full" />
          </n-form-item>
          <n-form-item :label="t('roles')" path="roles">
            <n-select v-model:value="formValue.roles" :options="accessStore.roles.filter(
              (role) => role.name != UserRole.SUPER_ADMIN
            )
              " :placeholder="t('roles')" placement="bottom" filterable multiple value-field="name"
              label-field="displayName" class="w-full" />
          </n-form-item>
          <n-form-item :label="t('status')" path="accountStatus">
            <n-tabs :key="refreshKey" v-model:value="formValue.accountStatus" type="segment" @update:value="(value: string | number) => {
              if (value == AccountStatus.DISABLED) sendCredentialsEmail = false
            }">
              <n-tab-pane :name="AccountStatus.ENABLED" :tab="t('activated')">
              </n-tab-pane>
              <n-tab-pane :name="AccountStatus.DISABLED" :tab="t('deactivated')">
              </n-tab-pane>
            </n-tabs>
          </n-form-item>
          <CustomTransition>
            <div class="flex justify-center mb-5">
              <n-checkbox v-model:checked="sendCredentialsEmail">
                <span v-if="currentEditItem">{{
                  t('resetAndSendCredentialsEmail')
                }}</span>
                <span v-else>{{ t('sendCredentialsEmailToUser') }}</span>
              </n-checkbox>
            </div>
          </CustomTransition>
        </n-form>
      </n-gi>
    </n-grid>
  </n-modal>
  <n-modal v-model:show="userPrefsDialog" :loading="isProceeding" preset="dialog" style="width: 500px" :bordered="false"
    :show-icon="false" :mask-closable="false" :title="t('userSettings')" :positive-text="t('validate')"
    :negative-text="t('cancel')" @positive-click="submitUserSettings" @negative-click="userPrefsDialog = false">
    <div class="h-4"></div>
    <n-card class="w-full" size="small">
      <n-space align="center" justify="space-between">
        <span>{{ t('notificationsInApp') }}</span>
        <n-switch v-model:value="userPrefs.inAppNotifEnabled" :checked-value="1" :unchecked-value="0" size="small">
          <template #checked>
            <div class="w-6"></div>
          </template>
          <template #unchecked>
            <div class="w-6"></div>
          </template>
        </n-switch>
      </n-space>
    </n-card>
    <div class="h-2"></div>
    <n-card class="w-full" size="small">
      <n-space align="center" justify="space-between">
        <span>{{ t('notificationsInEmail') }}</span>
        <n-switch v-model:value="userPrefs.emailNotifEnabled" :checked-value="1" :unchecked-value="0" size="small">
          <template #checked>
            <div class="w-6"></div>
          </template>
          <template #unchecked>
            <div class="w-6"></div>
          </template>
        </n-switch>
      </n-space>
    </n-card>
    <div class="h-4"></div>
  </n-modal>
  <Groups v-model:show="GroupsDialogVisible" />
</template>

<style scoped lang="scss"></style>

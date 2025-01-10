<script lang="ts">
  export default defineComponent({
    name: Routes.ROLES_MANAGEMENT.NAME,
  })
</script>

<script setup lang="ts">
  import { reformatDate } from '@/utils/chronos'

  import { RoleModel } from '@/models/role'

  import {
    DeleteFilled,
    EditFilled,
    PlusFilled,
    SearchFilled,
  } from '@vicons/material'

  import {
    FormInst,
    FormRules,
    FormValidationError,
    NButton,
    NIcon,
    NInput,
    NTag,
  } from 'naive-ui'
  import type { DataTableColumns } from 'naive-ui'

  import { h } from 'vue'

  import Routes from '@/router/routes'

  import { PermissionModel } from '@/models/permission'
  import { UserRole } from '@/enums/user-role'

  const loadingBar = useLoadingBar()
  const message = useMessage()
  const dialog = useDialog()

  const accessStore = useAccessStore()

  const { request } = useApi()
  const { t, locale } = useI18n()

  const search = ref<string>('')
  const searchInputRef = ref()
  const isLoading = ref(false)
  const pagination = { pageSize: 12 }
  const columns: DataTableColumns<RoleModel> = [
    {
      title: t('name'),
      key: 'displayName',
      resizable: true,
      width: 150,
      ellipsis: {
        tooltip: true,
      },
      fixed: 'left',
      sortOrder: false,
      sorter: 'default',
    },
    {
      title: t('description'),
      key: 'description',
      resizable: true,
      width: 250,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: t('permissionList'),
      key: 'permissions',
      resizable: true,
      width: 300,
      render(row: RoleModel) {
        return h(
          'div',
          {},
          {
            default: () => {
              const permissions = row.permissions?.map(
                (item: PermissionModel) => {
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
                }
              )

              return permissions
            },
          }
        )
      },
      sortOrder: false,
      sorter: 'default',
    },
    {
      title: t('lastEdition'),
      key: 'updatedAt',
      width: 150,
      render(row: RoleModel) {
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
      width: 150,
      render(row: RoleModel) {
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
          NInput,
          {
            ref: searchInputRef,
            placeholder: t('search'),
            value: search.value,
            onInput: (value: string) => {
              search.value = value
            },
          },
          {
            suffix: () => h(NIcon, {}, { default: () => h(SearchFilled) }),
          }
        )
      },
      key: 'actions',
      width: 180,
      render(row: RoleModel) {
        return h('div', { class: 'flex justify-end items-center w-full' }, [
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
          ),
          h('div', {
            class: 'w-2',
          }),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => {
                dialog.warning({
                  title: t('confirm'),
                  content: t('confirmDeleteRole'),
                  positiveText: t('yes'),
                  negativeText: t('no'),
                  onPositiveClick: async () => {
                    const task = await request({
                      url: `/roles/${row.id}`,
                      method: 'delete',
                    })

                    if (task.success) message.success(t('success'))
                    else message.error(t('anErrorOccured'))

                    init()
                  },
                })
              },
              renderIcon: () =>
                h(NIcon, null, {
                  default: () => h(DeleteFilled),
                }),
            }
            // { default: () => t('delete') }
          ),
        ])
      },
      fixed: 'right',
    },
  ]

  const searchedTableData = computed(() => {
    if (!search.value) {
      return accessStore.roles.filter(
        (data) => data.name !== UserRole.SUPER_ADMIN
      )
    }

    const searchedData = accessStore.roles.filter(
      (data) =>
        data.name !== UserRole.SUPER_ADMIN &&
        (data.name.toLowerCase().includes(search.value.toLowerCase()) ||
          data.displayName.toLowerCase().includes(search.value.toLowerCase()) ||
          data.description.toLowerCase().includes(search.value.toLowerCase()))
    )

    if (searchInputRef.value) searchInputRef.value.focus()

    return searchedData
  })

  const init = async () => {
    isLoading.value = true

    await accessStore.loadRoles()
    await accessStore.loadPermissions()

    isLoading.value = false
  }

  init()

  // Add & Edit

  const isProceeding = ref(false)
  const dialogVisible = ref(false)
  const currentEditItem = ref<RoleModel | null>(null)
  const formRef = ref<FormInst | null>(null)
  const formValue = ref<RoleModel>({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
  })
  const rules: FormRules = {
    name: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
    displayName: [
      {
        required: true,
        message: t('fillRequired'),
      },
    ],
  }

  const openFormModal = (item: RoleModel | null) => {
    currentEditItem.value = _.cloneDeep(item)

    if (item) {
      formValue.value = _.cloneDeep(item)
    } else {
      formValue.value = {
        name: '',
        displayName: '',
        description: '',
        permissions: [],
      }
    }

    dialogVisible.value = true
  }

  const submit = async () => {
    formRef.value?.validate(
      async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          if (currentEditItem.value) {
            if (
              currentEditItem.value.name !== formValue.value.name &&
              accessStore.roles.findIndex(
                (d) => d.name == formValue.value.name
              ) > -1
            ) {
              message.error(t('sameRoleNameMessage'))
            } else {
              loadingBar.start()
              isProceeding.value = true

              const task = await request({
                url: `/roles/${currentEditItem.value.id}`,
                method: 'put',
                data: {
                  displayName: formValue.value.displayName,
                  description: formValue.value.description,
                  permissions: formValue.value.permissions,
                },
              })

              if (task.success) message.success(t('success'))
              else message.error(t('anErrorOccured'))

              isProceeding.value = false
              loadingBar.finish()

              init()

              dialogVisible.value = false
            }
          } else {
            if (
              accessStore.roles.findIndex(
                (d) => d.name == _.kebabCase(formValue.value.displayName)
              ) > -1
            ) {
              message.error(t('sameRoleNameMessage'))
            } else {
              loadingBar.start()
              isProceeding.value = true

              const task = await request({
                url: '/roles',
                method: 'post',
                data: {
                  name: _.kebabCase(formValue.value.displayName),
                  displayName: formValue.value.displayName,
                  description: formValue.value.description,
                  permissions: formValue.value.permissions,
                } as RoleModel,
              })

              if (task.success) message.success(t('success'))
              else message.error(t('anErrorOccured'))

              isProceeding.value = false
              loadingBar.finish()

              init()

              dialogVisible.value = false
            }
          }
        }
      }
    )

    return false
  }

  const selectedPermissions = computed<any>({
    get() {
      try {
        return formValue.value.permissions?.map(
          (permission: PermissionModel) => permission.name
        )
      } catch (error) {
        return []
      }
    },
    set(newValue: string[]) {
      formValue.value.permissions = accessStore.permissions.filter(
        (permission: PermissionModel) => {
          return newValue.includes(permission.name)
        }
      )
    },
  })
</script>

<template>
  <PageLayout>
    <template #header-extra>
      <n-space>
        <n-button type="primary" @click="openFormModal(null)">
          <template #icon>
            <n-icon><PlusFilled /></n-icon>
          </template>
          {{ t('add') }}</n-button
        >
      </n-space>
    </template>
    <n-data-table
      :columns="columns"
      :data="searchedTableData"
      :pagination="pagination"
      :loading="isLoading"
      :single-line="false"
      :scroll-x="1200"
      striped />
  </PageLayout>
  <n-modal
    v-model:show="dialogVisible"
    :loading="isProceeding"
    preset="dialog"
    style="width: 500px"
    :bordered="false"
    :show-icon="false"
    :mask-closable="false"
    :title="currentEditItem ? t('edit') : t('add')"
    :positive-text="t('validate')"
    :negative-text="t('cancel')"
    @positive-click="submit"
    @negative-click="dialogVisible = false">
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      :show-require-mark="false"
      size="medium">
      <n-form-item :label="t('name')" path="displayName">
        <n-input
          v-model:value="formValue.displayName"
          :placeholder="t('name')"
          class="w-full" />
      </n-form-item>
      <n-form-item :label="t('description')" path="description">
        <n-input
          v-model:value="formValue.description"
          :placeholder="t('description')"
          type="textarea"
          class="w-full" />
      </n-form-item>
      <n-form-item :label="t('permissionList')" path="permissions">
        <n-select
          v-model:value="selectedPermissions"
          :options="(accessStore.permissions as any[])"
          :placeholder="t('permissionList')"
          :max-tag-count="4"
          placement="bottom"
          filterable
          multiple
          value-field="name"
          label-field="displayName"
          class="w-full" />
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style scoped lang="scss"></style>

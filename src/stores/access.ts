import { PermissionModel } from '@/models/permission'
import { RoleModel } from '@/models/role'

export interface AccessState {
  roles: RoleModel[]
  permissions: PermissionModel[]
}

export const useAccessStore = defineStore('access', {
  state: (): AccessState => ({
    roles: [],
    permissions: [],
  }),
  getters: {},
  actions: {
    async loadRoles() {
      const { request } = useApi()

      const task = await request({
        url: '/roles',
      })

      if (task.success && task.result.data) {
        this.roles = task.result.data
      }
    },

    async loadPermissions() {
      const { request } = useApi()

      const task = await request({
        url: '/permissions',
      })

      if (task.success && task.result.data) {
        this.permissions = task.result.data
      }
    },
  },
})

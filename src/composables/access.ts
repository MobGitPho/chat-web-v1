/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProfileType } from '@/enums/profile-type'
import { UserRole } from '@/enums/user-role'

import Routes from '@/router/routes'

import { RouteRecordRaw } from 'vue-router'

export const useAccess = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()

  const accessStore = useAccessStore()
  const { roles } = storeToRefs(accessStore)

  const authorizedRoutes: string[] = [
    Routes.ABOUT.NAME,
    Routes.ACCOUNT.NAME,
    Routes.VERIFY_EMAIL.NAME,
    Routes.DASHBOARD.NAME,
    Routes.NOTIFICATIONS.NAME,
  ]

  const userIsAbleTo = (permissionName: string): boolean => {
    return userHasPermission(
      (permissionName.startsWith('action-') ? '' : 'action-') + permissionName
    )
  }

  const userHasPermission = (permissionName: string): boolean => {
    return (
      (authStore.userData?.permissions?.findIndex(
        (permission) => permission.name === permissionName
      ) ?? -1) > -1
    )
  }

  const userHasRole = (roleName: string): boolean => {
    return (
      (authStore.userData?.roles?.findIndex((role) => role.name === roleName) ??
        -1) > -1
    )
  }

  const userHasSuperAdminRole = (): boolean => {
    return userHasRole(UserRole.SUPER_ADMIN)
  }

  const userHasAccessToRoute = (route: RouteRecordRaw) => {
    if (!route.meta) {
      return false
    }

    if (!route.meta.access) {
      return true
    }

    if (route.meta.access === 'all') {
      return true
    }

    if (Array.isArray(route.meta.access)) {
      return route.meta.access.includes(authStore.userData?.profileType)
    }

    return false
  }

  const userRoleIncludeThisRoute = (route: RouteRecordRaw) => {
    if (route?.meta?.access === 'all') return true

    const userRoles = authStore.userData?.roles || []
    const userProfileId = authStore.userData?.profileId || 0
    const isAdmin = authStore.userData?.profileType === ProfileType.ADMIN

    if (isAdmin && (userHasSuperAdminRole() || userProfileId > 0)) {
      if (userRoles.length) {
        let routeIncluded = authorizedRoutes.includes(String(route.name))

        if (routeIncluded) return true

        for (const role of userRoles) {
          routeIncluded = !!role.permissions?.find(
            (permission) =>
              permission.name === 'page-' + _.kebabCase(String(route.name))
          )

          if (routeIncluded) return true
        }

        return routeIncluded
      }
    }

    return false
  }

  const getRoleName = (id: number) => {
    return roles.value.find((r) => r.id == id)?.name || t('undefined')
  }

  const getRoleId = (name: string) => {
    return roles.value.find((r) => r.name == name)?.id || 0
  }

  return {
    getRoleId,
    getRoleName,
    userHasRole,
    userIsAbleTo,
    userHasPermission,
    userHasAccessToRoute,
    userHasSuperAdminRole,
    userRoleIncludeThisRoute,
  }
}

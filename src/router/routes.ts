export default {
  // Basic Routes
  SETUP: {
    NAME: 'Setup',
    PATH: '/setup',
  },
  HOME: {
    NAME: 'Home',
    PATH: '/',
    ALIAS: '/home',
  },
  NOT_FOUND: {
    NAME: '404',
    PATH: '/:pathMatch(.*)*',
  },
  LOGIN: {
    NAME: 'Login',
    PATH: '/login',
  },
  REGISTER: {
    NAME: 'Register',
    PATH: '/register',
  },
  ADD_NEW_PASSWORD: {
    NAME: 'AddNewPassword',
    PATH: '/add-new-password/:token',
  },
  RESET_PASSWORD: {
    NAME: 'ResetPassword',
    PATH: '/reset-password',
  },
  VERIFY_EMAIL: {
    NAME: 'VerifyEmail',
    PATH: '/verify-email/:id/:hash',
  },
  ACCOUNT_INFO_PORTAL: {
    NAME: 'AccountInfoPortal',
    PATH: '/account-info-portal',
  },
  // Shared Routes
  DASHBOARD: {
    NAME: 'Dashboard',
    PATH: '/dashboard',
  },
  ABOUT: {
    NAME: 'About',
    PATH: '/about',
  },
  ACCOUNT: {
    NAME: 'Account',
    PATH: '/account',
  },
  NOTIFICATIONS: {
    NAME: 'Notifications',
    PATH: '/notifications',
  },
  // Admin Routes
  SETTINGS: {
    NAME: 'Settings',
    PATH: '/settings',
  },
  ROLES_MANAGEMENT: {
    NAME: 'RolesManagement',
    PATH: '/roles-management',
  },
  USERS_MANAGEMENT: {
    NAME: 'UsersManagement',
    PATH: '/users-management',
  },
}

export {}

declare global {
  interface Window {
    // Useful for firebase phone auth
    recaptchaVerifier: any
    confirmationResult: any
    // Useful for naive-ui
    $notification: any
    $loadingBar: any
    $message: any
    $dialog: any
    $modal: any
  }
}

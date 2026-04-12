import { ref } from 'vue'

/**
 * Reusable toast notification composable.
 *
 * Usage:
 *   const { snackbar, notify } = useSnackbar()
 *   notify('Done!', '#2EBB57', 'mdi-check-circle')
 *
 * In template, include <SpotlySnackbar :snackbar="snackbar" />
 * or bind directly to v-snackbar.
 */
export function useSnackbar () {
  const snackbar = ref({ show: false, text: '', color: '', icon: '' })

  const notify = (
    text,
    color = '#D4AF37',
    icon = 'mdi-information-outline',
  ) => {
    snackbar.value = { show: true, text, color, icon }
  }

  const notifySuccess = text => notify(text, '#2EBB57', 'mdi-check-circle')
  const notifyError = text => notify(text, '#C71585', 'mdi-close-circle')
  const notifyGold = text => notify(text, '#D4AF37', 'mdi-star-four-points')

  return { snackbar, notify, notifySuccess, notifyError, notifyGold }
}

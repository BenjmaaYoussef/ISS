<template>
  <!--
    Drop-in snackbar that pairs with useSnackbar() composable.

    Usage:
      const { snackbar, notify } = useSnackbar()
      <SpotlySnackbar :snackbar="snackbar" />
  -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :location="location"
    rounded="lg"
    :timeout="timeout"
  >
    <v-icon v-if="snackbar.icon" start>{{ snackbar.icon }}</v-icon>
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup>
  defineProps({
    /** The reactive snackbar object from useSnackbar() */
    snackbar: {
      type: Object,
      required: true,
    },
    timeout: {
      type: Number,
      default: 2500,
    },
    location: {
      type: String,
      default: 'bottom right',
    },
  })
</script>

/**
 * plugins/vuetify.js
 *
 * Spotly Design System — Luxury Venue Booking & Experience Management System
 * Colors, typography, and component defaults aligned with the Spotly brand.
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

const spotlyTheme = {
  dark: true,
  colors: {
    // Core palette
    background: "#0A0E14", // Midnight Base
    surface: "#13181F", // Slightly lifted surface
    primary: "#D4AF37", // Champagne Gold — luxury / action
    secondary: "#2EBB57", // Status Green — available
    error: "#C71585", // Status Rose — reserved / pending
    // Aliases used in components
    gold: "#D4AF37",
    "status-green": "#2EBB57",
    "status-rose": "#C71585",
    // Text
    "on-background": "#F5F0E8",
    "on-surface": "#F5F0E8",
    "on-primary": "#0A0E14",
  },
};

export default createVuetify({
  theme: {
    defaultTheme: "spotlyTheme",
    themes: { spotlyTheme },
  },
  defaults: {
    // ── Buttons ────────────────────────────────────────────────────────────
    VBtn: {
      variant: "flat",
      color: "primary",
      rounded: "sm",
      style:
        'font-family: "Inter", sans-serif; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;',
    },
    // ── Cards ──────────────────────────────────────────────────────────────
    VCard: {
      color: "surface",
      rounded: "lg",
      elevation: 4,
    },
    // ── Text Fields ────────────────────────────────────────────────────────
    VTextField: {
      variant: "outlined",
      color: "primary",
    },
    VTextarea: {
      variant: "outlined",
      color: "primary",
    },
    VSelect: {
      variant: "outlined",
      color: "primary",
    },
    // ── Chips (status badges) ──────────────────────────────────────────────
    VChip: {
      rounded: "sm",
    },
    // ── Dialogs ────────────────────────────────────────────────────────────
    VDialog: {
      maxWidth: "520",
    },
  },
});

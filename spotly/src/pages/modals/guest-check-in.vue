<template>
  <v-container
    class="py-10 d-flex flex-column align-center justify-center"
    style="min-height: 80vh"
  >
    <div class="modal-backdrop-card">
      <div class="mbc-strip mbc-strip--gold" />
      <div class="d-flex align-center gap-2 mb-2 mt-1">
        <v-icon size="15" color="#d4af37">mdi-account-check-outline</v-icon>
        <span class="mbc-id">D2</span>
        <span class="mbc-title">Guest Check-In & Operational Notes</span>
        <v-chip size="x-small" color="warning" variant="tonal" class="ml-auto"
          >F14</v-chip
        >
      </div>
      <p class="mbc-desc">
        Staff dialog to mark a guest as arrived or a no-show and log internal
        operational notes against the reservation.
      </p>
      <v-btn class="mbc-reopen-btn mt-4" @click="open = true">
        <v-icon start size="14">mdi-refresh</v-icon>
        Reopen Dialog
      </v-btn>
    </div>

    <GuestCheckInDialog
      v-model="open"
      :reservation="reservation"
      @mark-arrived="onArrived"
      @mark-no-show="onNoShow"
    />
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import GuestCheckInDialog from "@/components/dialogs/GuestCheckInDialog.vue";

const open = ref(true);

const reservation = {
  id: 104,
  guest: "Epon M.",
  partySize: 2,
  tableId: "T-12",
  environment: "Indoor",
  clientNote: "It's my birthday",
  staffNote: "Guest arrived early. Seated at bar first.",
};

function onArrived(payload) {
  console.log("[D2] Marked as arrived:", payload);
}
function onNoShow(payload) {
  console.log("[D2] Marked as no-show:", payload);
}
</script>

<style scoped>
.modal-backdrop-card {
  background: var(--color-surface-elevated);
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 14px;
  padding: 20px 24px;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
}

.mbc-strip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.mbc-strip--gold {
  background: linear-gradient(90deg, #d4af37, transparent);
}

.mbc-id {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #d4af37;
  text-transform: uppercase;
}
.mbc-title {
  font-family: var(--font-heading);
  font-size: 0.92rem;
  color: #f5f0e8;
}
.mbc-desc {
  font-size: 0.8rem;
  color: #6b7a8d;
  line-height: 1.55;
  margin-top: 6px;
}

.mbc-reopen-btn {
  background: rgba(212, 175, 55, 0.1) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: #d4af37 !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  width: 100%;
}
</style>

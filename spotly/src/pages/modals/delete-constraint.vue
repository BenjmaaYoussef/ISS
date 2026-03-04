<template>
  <v-container
    class="py-10 d-flex flex-column align-center justify-center"
    style="min-height: 80vh"
  >
    <div class="modal-backdrop-card">
      <div class="mbc-strip mbc-strip--error" />
      <div class="d-flex align-center gap-2 mb-2 mt-1">
        <v-icon size="15" color="#e05252">mdi-alert-outline</v-icon>
        <span class="mbc-id">D1</span>
        <span class="mbc-title">Delete Constraint Warning</span>
        <v-chip size="x-small" color="error" variant="tonal" class="ml-auto"
          >F4</v-chip
        >
      </div>
      <p class="mbc-desc">
        Blocks an admin from deleting a table that has future reservations.
      </p>
      <v-btn class="mbc-reopen-btn mt-4" @click="open = true">
        <v-icon start size="14">mdi-refresh</v-icon>
        Reopen Dialog
      </v-btn>
    </div>

    <DeleteConstraintDialog
      v-model="open"
      table-name="Table #3"
      :reservations="reservations"
    />
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import DeleteConstraintDialog from "@/components/dialogs/DeleteConstraintDialog.vue";

const open = ref(true);

const reservations = [
  { id: 102, guest: "John Doe", datetime: "Feb 15, 19:00" },
  { id: 105, guest: "Sarah Smith", datetime: "Feb 16, 20:00" },
];
</script>

<style scoped>
.modal-backdrop-card {
  background: var(--color-surface-elevated);
  border: 1px solid rgba(224, 82, 82, 0.2);
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
.mbc-strip--error {
  background: linear-gradient(90deg, #e05252, transparent);
}

.mbc-id {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #e05252;
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
  background: rgba(224, 82, 82, 0.1) !important;
  border: 1px solid rgba(224, 82, 82, 0.3) !important;
  color: #e05252 !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  width: 100%;
}
</style>

<template>
  <!--
    D1: Delete Constraint Warning  (Feature F4 — Deletion Constraints)

    Blocks an admin from deleting a table that has future reservations.
    The dialog is non-dismissable except via the OK button.

    Usage:
      <DeleteConstraintDialog
        v-model="showDialog"
        :table-name="'Table #3'"
        :reservations="[
          { id: 102, guest: 'John Doe',   datetime: 'Feb 15, 19:00' },
          { id: 105, guest: 'Sarah Smith', datetime: 'Feb 16, 20:00' },
        ]"
      />
  -->
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="dcd-card">
      <!-- Red error strip at top -->
      <div class="dcd-strip" />

      <!-- Header -->
      <v-card-title class="dcd-title px-6 pt-5 pb-3 d-flex align-center gap-3">
        <div class="dcd-icon-wrap">
          <v-icon size="20" color="#e05252">mdi-alert-outline</v-icon>
        </div>
        <span>ERROR: Cannot Delete Element</span>
      </v-card-title>

      <v-divider style="border-color: rgba(224, 82, 82, 0.2)" />

      <!-- Body -->
      <v-card-text class="px-6 py-4">
        <p class="dcd-body-text mb-3">
          You are attempting to delete
          <span class="dcd-table-name">"{{ tableName }}"</span>. This action is
          <strong class="dcd-blocked">blocked</strong> because there are
          existing reservations attached to this entity:
        </p>

        <!-- Reservation list -->
        <div class="dcd-res-list">
          <div
            v-for="(res, idx) in reservations"
            :key="res.id"
            class="dcd-res-item"
          >
            <span class="dcd-res-index">{{ idx + 1 }}.</span>
            <span class="dcd-res-text">
              Reservation
              <span class="dcd-res-id">#{{ res.id }}</span>
              &mdash; {{ res.guest }}
              <span class="dcd-res-date">({{ res.datetime }})</span>
            </span>
          </div>
        </div>

        <p class="dcd-footer-note mt-4">
          Please move or cancel these reservations first.
        </p>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn class="dcd-ok-btn" @click="$emit('update:modelValue', false)">
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  /** Human-readable table name, e.g. "Table #3" */
  tableName: {
    type: String,
    default: "Table #m",
  },
  /**
   * Array of conflicting reservations.
   * Each item: { id: Number, guest: String, datetime: String }
   */
  reservations: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
/* ── Card shell ──────────────────────────────────────── */
.dcd-card {
  background: #161d28 !important;
  border: 1px solid rgba(224, 82, 82, 0.25) !important;
  border-radius: 16px !important;
}

/* Red top strip */
.dcd-strip {
  height: 3px;
  background: linear-gradient(90deg, #e05252, transparent);
  border-radius: 16px 16px 0 0;
}

/* ── Title ───────────────────────────────────────────── */
.dcd-title {
  font-family: "Playfair Display", serif !important;
  font-size: 1.05rem !important;
  color: #e05252 !important;
  letter-spacing: 0.01em;
}

.dcd-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(224, 82, 82, 0.12);
  flex-shrink: 0;
}

/* ── Body text ───────────────────────────────────────── */
.dcd-body-text {
  font-size: 0.875rem;
  color: rgba(245, 240, 232, 0.82);
  line-height: 1.6;
}

.dcd-table-name {
  color: #d4af37;
  font-weight: 600;
}

.dcd-blocked {
  color: #e05252;
  font-weight: 700;
}

/* ── Reservation list ────────────────────────────────── */
.dcd-res-list {
  background: rgba(224, 82, 82, 0.05);
  border: 1px solid rgba(224, 82, 82, 0.18);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dcd-res-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.dcd-res-index {
  font-size: 0.8rem;
  color: #6b7a8d;
  min-width: 14px;
}

.dcd-res-text {
  font-size: 0.875rem;
  color: rgba(245, 240, 232, 0.82);
}

.dcd-res-id {
  color: #d4af37;
  font-weight: 600;
}

.dcd-res-date {
  color: #6b7a8d;
  font-size: 0.82rem;
}

/* ── Footer note ─────────────────────────────────────── */
.dcd-footer-note {
  font-size: 0.82rem;
  color: #6b7a8d;
  font-style: italic;
}

/* ── OK button ───────────────────────────────────────── */
.dcd-ok-btn {
  background: rgba(224, 82, 82, 0.12) !important;
  border: 1px solid rgba(224, 82, 82, 0.35) !important;
  color: #e05252 !important;
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  min-width: 88px;
  letter-spacing: 0.05em;
}
</style>

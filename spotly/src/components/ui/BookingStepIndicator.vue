<template>
  <!--
    Booking flow step pip indicator.
    Usage:
      <BookingStepIndicator
        :steps="[{label:'Environment'},{label:'Select Table'},{label:'Confirm'}]"
        :current-step="2"
      />
  -->
  <div class="step-indicator d-flex align-center">
    <template v-for="(step, index) in steps" :key="index">
      <!-- Pip -->
      <div
        class="step-pip"
        :class="{
          'step-pip--done': index + 1 < currentStep,
          'step-pip--active': index + 1 === currentStep,
        }"
      >
        <v-icon v-if="index + 1 < currentStep" size="11">mdi-check</v-icon>
        <span v-else>{{ index + 1 }}</span>
      </div>

      <!-- Step label (only on active) -->
      <span v-if="index + 1 === currentStep" class="step-lbl ml-2 mr-2">
        {{ step.label }}
      </span>

      <!-- Connector line (not after last step) -->
      <div
        v-if="index + 1 < steps.length"
        class="step-line"
        :class="{ 'step-line--done': index + 1 < currentStep }"
      />
    </template>
  </div>
</template>

<script setup>
  defineProps({
    steps: {
      type: Array,
      required: true,
    // Each: { label: string }
    },
    currentStep: {
      type: Number,
      required: true,
    },
  })
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
}
.step-pip {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.18);
  color: #6b7a8d;
  flex-shrink: 0;
}
.step-pip--active {
  background: rgba(212, 175, 55, 0.18) !important;
  border-color: #d4af37 !important;
  color: #d4af37 !important;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.3);
}
.step-pip--done {
  background: rgba(46, 187, 87, 0.15) !important;
  border-color: #2ebb57 !important;
  color: #2ebb57 !important;
}
.step-line {
  width: 28px;
  height: 1px;
  background: rgba(212, 175, 55, 0.18);
  flex-shrink: 0;
}
.step-line--done {
  background: #2ebb57;
}
.step-lbl {
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>

<template>
  <AppNavbarApp :show-back-link="true" />

  <v-main>
    <v-sheet
      color="background"
      class="d-flex align-center justify-center"
      style="
        min-height: 100vh;
        padding: 120px 24px 80px;
        position: relative;
        overflow: hidden;
      "
    >
      <!-- Glow -->
      <div
        style="
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 80% 60% at 50% 40%,
            rgba(212, 175, 55, 0.07),
            transparent 70%
          );
          pointer-events: none;
        "
      />

      <!-- Grid texture -->
      <div
        style="
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(212, 175, 55, 0.03) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          pointer-events: none;
        "
      />

      <!-- Card -->
      <v-card
        flat
        style="
          width: 100%;
          max-width: 460px;
          background: #13181f;
          border: 1px solid rgba(212, 175, 55, 0.2);
          padding: 52px 44px 44px;
          position: relative;
          animation: fadeUp 0.5s ease both;
        "
      >
        <!-- Gold top line -->
        <div
          style="
            position: absolute;
            top: 0;
            left: 10%;
            right: 10%;
            height: 2px;
            background: linear-gradient(
              90deg,
              transparent,
              #d4af37,
              transparent
            );
          "
        />

        <!-- Eyebrow -->
        <div
          style="
            font-family: &quot;Inter&quot;, sans-serif;
            font-size: 0.72rem;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #d4af37;
            margin-bottom: 10px;
          "
        >
          Venue Management
        </div>

        <!-- Title -->
        <h1
          style="
            font-family: &quot;Playfair Display&quot;, serif;
            font-size: 1.9rem;
            font-weight: 700;
            color: #fff;
            line-height: 1.2;
            margin-bottom: 8px;
          "
        >
          Sign in to your<br />Dashboard
        </h1>

        <p
          style="
            color: rgba(255, 255, 255, 0.45);
            font-size: 0.87rem;
            font-family: &quot;Inter&quot;, sans-serif;
            margin-bottom: 36px;
          "
        >
          Access your venue, bookings &amp; reservations.
        </p>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-5"
          style="font-family: &quot;Inter&quot;, sans-serif; font-size: 0.83rem"
          :text="error"
        />

        <v-form @submit.prevent="login">
          <!-- Email -->
          <div
            style="
              font-size: 0.75rem;
              font-weight: 500;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.5);
              margin-bottom: 8px;
            "
          >
            Email Address
          </div>
          <v-text-field
            v-model="email"
            type="email"
            placeholder="admin@yourvenueplace.com"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-email-outline"
            color="primary"
            class="mb-4"
            :rules="[rules.required, rules.email]"
            style="font-family: &quot;Inter&quot;, sans-serif"
          />

          <!-- Password -->
          <div
            style="
              font-size: 0.75rem;
              font-weight: 500;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.5);
              margin-bottom: 8px;
            "
          >
            Password
          </div>
          <v-text-field
            v-model="password"
            :type="showPass ? 'text' : 'password'"
            placeholder="Enter your password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="
              showPass ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
            "
            color="primary"
            class="mb-2"
            :rules="[rules.required]"
            style="font-family: &quot;Inter&quot;, sans-serif"
            @click:append-inner="showPass = !showPass"
          />

          <!-- Remember / Forgot -->
          <div class="d-flex align-center justify-space-between mb-6">
            <v-checkbox
              v-model="remember"
              label="Remember me"
              color="primary"
              density="compact"
              hide-details
              style="
                font-family: &quot;Inter&quot;, sans-serif;
                font-size: 0.83rem;
              "
            />
            <a
              href="#"
              style="
                color: #d4af37;
                font-size: 0.83rem;
                font-family: &quot;Inter&quot;, sans-serif;
                text-decoration: none;
              "
              @click.prevent="forgotPassword"
            >
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            style="
              font-size: 0.85rem;
              letter-spacing: 2.5px;
              text-transform: uppercase;
              color: #0a0e14;
              font-weight: 600;
              height: 52px;
            "
          >
            Login
          </v-btn>
        </v-form>

        <div
          style="
            text-align: center;
            margin-top: 28px;
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.35);
            font-family: &quot;Inter&quot;, sans-serif;
          "
        >
          Don't have an account?
          <a
            href="#"
            style="color: #d4af37; text-decoration: none; margin-left: 4px"
            >Request Access</a
          >
        </div>
      </v-card>
    </v-sheet>
  </v-main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppNavbarApp from "@/components/layout/AppNavbarApp.vue";

const router = useRouter();

const email = ref("");
const password = ref("");
const remember = ref(false);
const showPass = ref(false);
const loading = ref(false);
const error = ref("");

const rules = {
  required: (v) => !!v || "This field is required.",
  email: (v) => /.+@.+\..+/.test(v) || "Enter a valid email.",
};

async function login() {
  error.value = "";
  if (!email.value || !password.value) {
    error.value = "Please fill in all fields.";
    return;
  }
  loading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/venue/demo"); // redirect after login
  } catch (e) {
    error.value = "Invalid credentials. Please try again.";
  } finally {
    loading.value = false;
  }
}

function forgotPassword() {
  router.push("/auth");
}
</script>

<style scoped>
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

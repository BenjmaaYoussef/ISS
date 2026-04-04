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
          border: 1px solid rgba(212, 175, 55, 0.18);
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
            font-family: 'Inter', sans-serif;
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
            font-family: 'Playfair Display', serif;
            font-size: 1.9rem;
            font-weight: 700;
            color: #fff;
            line-height: 1.2;
            margin-bottom: 8px;
          "
        >
          {{ isRegister ? 'Create an Account' : 'Sign in to your' }}<br />
          {{ isRegister ? '' : 'Dashboard' }}
        </h1>

        <p
          style="
            color: rgba(255, 255, 255, 0.45);
            font-size: 0.87rem;
            font-family: 'Inter', sans-serif;
            margin-bottom: 36px;
          "
        >
          {{ isRegister ? 'Fill in your details to request access.' : 'Access your venue, bookings &amp; reservations.' }}
        </p>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-5"
          style="font-family: 'Inter', sans-serif; font-size: 0.83rem"
          :text="error"
        />

        <!-- ── LOGIN FORM ── -->
        <v-form v-if="!isRegister" @submit.prevent="login">
          <!-- Email -->
          <div class="field-label">Email Address</div>
          <v-text-field
            v-model="email"
            type="email"
            placeholder="admin@spotly.com"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-email-outline"
            color="primary"
            class="mb-4"
            :rules="[rules.required, rules.email]"
            style="font-family: 'Inter', sans-serif"
          />

          <!-- Password -->
          <div class="field-label">Password</div>
          <v-text-field
            v-model="password"
            :type="showPass ? 'text' : 'password'"
            placeholder="Enter your password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPass ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            color="primary"
            class="mb-2"
            :rules="[rules.required]"
            style="font-family: 'Inter', sans-serif"
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
              style="font-family: 'Inter', sans-serif; font-size: 0.83rem"
            />
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

        <!-- ── REGISTER FORM ── -->
        <v-form v-else @submit.prevent="register">
          <!-- First Name -->
          <div class="field-label">First Name</div>
          <v-text-field
            v-model="regFirstName"
            placeholder="John"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-outline"
            color="primary"
            class="mb-4"
            :rules="[rules.required]"
            style="font-family: 'Inter', sans-serif"
          />

          <!-- Last Name -->
          <div class="field-label">Last Name</div>
          <v-text-field
            v-model="regLastName"
            placeholder="Doe"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-outline"
            color="primary"
            class="mb-4"
            :rules="[rules.required]"
            style="font-family: 'Inter', sans-serif"
          />

          <!-- Email -->
          <div class="field-label">Email Address</div>
          <v-text-field
            v-model="regEmail"
            type="email"
            placeholder="you@example.com"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-email-outline"
            color="primary"
            class="mb-4"
            :rules="[rules.required, rules.email]"
            style="font-family: 'Inter', sans-serif"
          />

          <!-- Password -->
          <div class="field-label">Password</div>
          <v-text-field
            v-model="regPassword"
            :type="showPass ? 'text' : 'password'"
            placeholder="Choose a password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPass ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            color="primary"
            class="mb-4"
            :rules="[rules.required]"
            style="font-family: 'Inter', sans-serif"
            @click:append-inner="showPass = !showPass"
          />

          <!-- Role -->
          <div class="field-label">Account Type</div>
          <v-select
            v-model="regRole"
            :items="roleOptions"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-shield-account-outline"
            color="primary"
            class="mb-6"
            style="font-family: 'Inter', sans-serif"
          />

          <!-- Register Button -->
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
            Create Account
          </v-btn>
        </v-form>

        <!-- Toggle login / register -->
        <div
          style="
            text-align: center;
            margin-top: 28px;
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.35);
            font-family: 'Inter', sans-serif;
          "
        >
          {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
          <a
            href="#"
            style="color: #d4af37; text-decoration: none; margin-left: 4px"
            @click.prevent="toggleMode"
          >
            {{ isRegister ? 'Sign In' : 'Request Access' }}
          </a>
        </div>
      </v-card>
    </v-sheet>
  </v-main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppNavbarApp from "@/components/layout/AppNavbarApp.vue";
import { getUserByEmailAndPassword, addUser, userExists } from "@/datamodel/User.js";
import { User } from "@/datamodel/User.js";

const router = useRouter();

// ── Login state ────────────────────────────────────────────────────────────────
const email = ref("");
const password = ref("");
const remember = ref(false);
const showPass = ref(false);
const loading = ref(false);
const error = ref("");

// ── Register state ─────────────────────────────────────────────────────────────
const isRegister = ref(false);
const regFirstName = ref("");
const regLastName = ref("");
const regEmail = ref("");
const regPassword = ref("");
const regRole = ref("client");
const roleOptions = [
  { title: "Client", value: "client" },
  { title: "Staff", value: "staff" },
  { title: "Admin", value: "admin" },
];

const rules = {
  required: (v) => !!v || "This field is required.",
  email: (v) => /.+@.+\..+/.test(v) || "Enter a valid email.",
};

function writeSessionAndRedirect(user) {
  localStorage.setItem(
    "spotly_session",
    JSON.stringify({
      userId: user.email,
      name: user.first_name + " " + user.last_name,
      email: user.email,
      role: user.role,
    })
  );
  if (user.role === "admin") router.push("/admin/dashboard");
  else if (user.role === "staff") router.push("/staff/dashboard");
  else router.push("/home");
}

async function login() {
  error.value = "";
  if (!email.value || !password.value) {
    error.value = "Please fill in all fields.";
    return;
  }
  loading.value = true;
  try {
    const user = getUserByEmailAndPassword(email.value, password.value);
    if (!user) {
      error.value = "Invalid credentials. Please try again.";
      return;
    }
    writeSessionAndRedirect(user);
  } finally {
    loading.value = false;
  }
}

async function register() {
  error.value = "";
  if (!regFirstName.value || !regLastName.value || !regEmail.value || !regPassword.value) {
    error.value = "Please fill in all fields.";
    return;
  }
  if (userExists(regEmail.value)) {
    error.value = "An account with that email already exists.";
    return;
  }
  loading.value = true;
  try {
    const newUser = new User({
      first_name: regFirstName.value,
      last_name: regLastName.value,
      email: regEmail.value,
      password: regPassword.value,
      role: regRole.value,
    });
    addUser(newUser);
    writeSessionAndRedirect(newUser);
  } finally {
    loading.value = false;
  }
}

function toggleMode() {
  isRegister.value = !isRegister.value;
  error.value = "";
}
</script>

<style scoped>
.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
  font-family: "Inter", sans-serif;
}
</style>

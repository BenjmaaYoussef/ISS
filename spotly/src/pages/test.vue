<template>
  <div v-if="isDev">
    <h1>Test Page</h1>
    <ol>
      <li v-for="user in getAllUsers()" :key="user.email">
        {{ user.first_name }} {{ user.last_name }}
      </li>
    </ol>
    <v-text-field label="First name:" v-model="first_name"></v-text-field>
    <v-btn color="primary" @click="doAddUser">Add User</v-btn>
  </div>
</template>

<script setup>
import { getAllUsers, User, addUser } from "@/datamodel/User";
import { ref } from "vue";

const isDev = import.meta.env.DEV;

let first_name = ref("");

function doAddUser() {
  // Implement the logic to add a user here
  let user = new User({
    first_name: first_name.value,
    last_name: "Doe",
    email: `${first_name.value.toLowerCase()}@example.com`,
    password: "password123",
  });

  addUser(user);
}
</script>

<style scoped>
/* Add your styles here */
</style>

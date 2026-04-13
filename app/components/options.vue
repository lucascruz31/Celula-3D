<template>
  <v-speed-dial
    location="right center"
    transition="slide-y-reverse-transition"
  >
    <template v-slot:activator="{ props: activatorProps }">
      <v-fab
        v-bind="activatorProps"
        size="large"
        icon="$vuetify"
      ></v-fab>
    </template>

    <v-btn key="1" icon="$success" to="/"></v-btn>
    <v-btn key="2" icon="$info" to="/CellA"></v-btn>
    <v-btn key="3" icon="$warning" to="/about"></v-btn>
    <v-btn key="4" icon="$error"></v-btn>
  </v-speed-dial>
</template>
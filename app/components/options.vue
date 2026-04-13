<template>
  <v-speed-dial
    location="right center"
    transition="slide-y-reverse-transition"
  >
    <template v-slot:activator="{ props: activatorProps }">
      <v-fab
        v-bind="activatorProps"
        size="large"
        icon="$menu"
      ></v-fab>
    </template>

    <v-btn key="1" icon="$info" to="/"></v-btn>
    <v-btn key="2" icon="$prev" to="/CellA"></v-btn>
    <v-btn key="3" icon="$next" to="/about"></v-btn>
    <v-btn key="4" icon="$cancel"></v-btn>
  </v-speed-dial>
</template>
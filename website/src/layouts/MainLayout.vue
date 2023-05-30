<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="text-center">
        <q-toolbar-title> Väder Jakten </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
const SMHIdata = [];
const KLARTdata = [];
const city = ref("");
const app = async () => {
  KLARTdata.value = [];
  SMHIdata.value = [];
  const api = await axios.post("http://localhost:3000/smhi", {
    city: city.value,
  });
  SMHIdata.push(api.data);
  const response = await axios.post("http://localhost:3000/klart", {
    city: city.value,
  });
  KLARTdata.push(response.data);
  console.log(SMHIdata);
  console.log(KLARTdata);
  city.value = "";
};
</script>
<style>
.pointer-cursor {
  cursor: pointer;
}
</style>

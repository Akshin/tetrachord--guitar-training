<script setup lang="ts">
import SiteNav from '@/components/SiteNav.vue'
</script>

<template>
  <a class="skip-link" href="#main">К содержанию</a>
  <div class="page-grain" aria-hidden="true" />
  <SiteNav />
  <RouterView />
</template>

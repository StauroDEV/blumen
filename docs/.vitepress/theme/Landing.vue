<template>
  <Layout>
    <template #home-hero-before>
      <Hero />
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import Hero from './components/Hero.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <header class="my-hero">
    <div class="container">
     <img class="logo" src="/logo-text.svg" alt="Blumen logo" width="200" height="200">
      <h1 class="title">Self-custodial decentralized web deployments</h1>
      <img src="/demo.png" alt="Blumen logo">
      <p class="subtitle">
        Blumen is the ultimate command-line deployment tool with automatic replication of content to independent IPFS providers and multi-factor authorization of ENS updates. No sign up required.
      </p>
     <div class="links">
        <a href="/guide/getting-started">Get Started</a>
        <a target="_blank" rel="noreferer" href="https://github.com/StauroDEV/blumen">GitHub</a>
     </div>
    </div>
</header>
</template>

<style scoped>
.my-hero {
  text-align: center;
  margin: 0 auto;
  padding: 2rem 0;
  max-width: 640px;
}
.container {
      display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.title {
  line-height: 1.2;
  font-size: 1.25rem;
}
.subtitle {
  font-size: 0.8rem;
}

.links {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

html.dark .my-hero .logo {
    content: url("/logo-dark.svg");
}
</style>

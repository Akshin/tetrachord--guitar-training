<template>
  <main id="main" class="missing">
    <h1>Страницы нет</h1>
    <p>Этот адрес не ведёт к тренировке.</p>
    <RouterLink to="/">На главную</RouterLink>
  </main>
</template>

<style scoped>
.missing {
  max-width: 36rem;
  min-height: calc(100dvh - 4.5rem);
  margin: 0 auto;
  padding: 5rem 1rem;
}

.missing h1 {
  margin: 0 0 0.6rem;
  font-size: 2.2rem;
  letter-spacing: -0.04em;
}

.missing p {
  margin: 0 0 1.5rem;
  color: var(--muted);
}

.missing a {
  color: var(--accent-ink);
  background: var(--accent);
  padding: 0.55rem 1rem;
  border-radius: var(--radius-pill);
  text-decoration: none;
  font-weight: 600;
}
</style>

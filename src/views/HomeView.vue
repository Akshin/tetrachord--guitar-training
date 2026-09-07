<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhArrowUpRight } from '@phosphor-icons/vue'
import IntervalScheme, { type IntervalKind } from '@/components/IntervalScheme.vue'

const positions: { title: string; pattern: IntervalKind[] }[] = [
  { title: 'Тон, тон, полутон', pattern: ['tone', 'tone', 'semitone'] },
  { title: 'Тон, полутон, тон', pattern: ['tone', 'semitone', 'tone'] },
  { title: 'Полутон, тон, тон', pattern: ['semitone', 'tone', 'tone'] },
]

const goingUp = ref(true)
const demoPattern = computed(() =>
  goingUp.value ? positions[0]!.pattern : [...positions[0]!.pattern].reverse(),
)
</script>

<template>
  <main id="main" class="home">
    <section class="hero">
      <div class="hero__copy">
        <h1 class="hero__title">Тетрахорд на грифе</h1>
        <p class="hero__lead">
          Игра для тех, кто мыслит четырьмя ступенями: тон, полутон, вверх и вниз.
        </p>
        <RouterLink to="/play" class="cta">
          Играть
          <span class="cta__icon" aria-hidden="true">
            <PhArrowUpRight :size="16" weight="light" />
          </span>
        </RouterLink>
      </div>

      <div class="hero__stage">
        <div class="bezel">
          <div class="bezel__core">
            <p class="hero__stage-kicker">Схема 1, {{ goingUp ? 'вверх' : 'вниз' }}</p>
            <IntervalScheme :pattern="demoPattern" />
            <div class="hero__toggle">
              <button
                type="button"
                class="dir"
                :aria-pressed="goingUp"
                @click="goingUp = true"
              >
                Вверх
              </button>
              <button
                type="button"
                class="dir"
                :aria-pressed="!goingUp"
                @click="goingUp = false"
              >
                Вниз
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="define">
      <h2>Что такое тетрахорд</h2>
      <p>
        Тетрахорд - звукоряд из четырёх последовательных ступеней, охватывающий интервал
        чистой кварты. Исторически из него собирали лады и гаммы: в греческой музыке, в
        народных традициях, и сейчас на грифе.
      </p>
    </section>

    <section id="positions" class="positions">
      <h2>Три позиции схемы</h2>
      <p class="positions__lead">
        Их можно комбинировать и собирать лад. Между схемами стоит связующая нота: тон
        связующий, ТС.
      </p>
      <ol class="positions__list">
        <li v-for="(pos, i) in positions" :key="pos.title" class="pos">
          <span class="pos__n">{{ i + 1 }}</span>
          <div class="pos__body">
            <h3>{{ pos.title }}</h3>
            <IntervalScheme :pattern="pos.pattern" />
          </div>
        </li>
      </ol>
    </section>

    <section class="legend">
      <h2>Цвета в тренировке</h2>
      <dl class="legend__row">
        <div>
          <dt><span class="swatch swatch--tone" /> Тон</dt>
          <dd>Жёлтый</dd>
        </div>
        <div>
          <dt><span class="swatch swatch--semi" /> Полутон</dt>
          <dd>Зелёный</dd>
        </div>
        <div>
          <dt><span class="swatch swatch--tc" /> Тон связующий</dt>
          <dd>Серый</dd>
        </div>
      </dl>
    </section>

    <section class="mirror">
      <div class="bezel bezel--wide">
        <div class="bezel__core bezel__core--mirror">
          <h2>Вверх и вниз зеркально</h2>
          <p>
            Схему играют от ноты в обе стороны. Нисходящий ход - это восходящий, прочитанный
            наоборот.
          </p>
          <div class="mirror__pair">
            <figure>
              <figcaption>Схема 1 вверх</figcaption>
              <IntervalScheme :pattern="positions[0]!.pattern" />
            </figure>
            <figure>
              <figcaption>Та же схема вниз</figcaption>
              <IntervalScheme :pattern="positions[0]!.pattern" reverse />
            </figure>
          </div>
        </div>
      </div>
    </section>

    <section class="join">
      <h2>Как схемы становятся ладом</h2>
      <p>
        Две схемы стыкуются серым ТС. Связующий тон не ломает кварту каждой схемы, он
        склеивает их в один ход.
      </p>
      <div class="join__track" aria-label="Две схемы и связующий тон">
        <IntervalScheme :pattern="positions[0]!.pattern" :show-degrees="false" />
        <span class="swatch swatch--tc swatch--lg" title="Тон связующий" />
        <IntervalScheme :pattern="positions[1]!.pattern" :show-degrees="false" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem 5rem;
}

.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  min-height: calc(100dvh - 4.5rem);
  padding-top: 2.5rem;
  padding-bottom: 3rem;
  align-items: center;
}

@media (min-width: 768px) {
  .hero {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 4rem;
    padding-top: 3rem;
  }
}

.hero__title {
  margin: 0 0 0.85rem;
  font-size: clamp(2.25rem, 6vw, 4.25rem);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 1.08;
  text-wrap: balance;
}

.hero__lead {
  margin: 0 0 1.75rem;
  max-width: 36ch;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.35rem 0.35rem 0.35rem 1.25rem;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 420ms var(--ease),
    filter 420ms var(--ease);
}

.cta:hover {
  filter: brightness(1.06);
}

.cta:hover .cta__icon {
  transform: translate(2px, -1px) scale(1.05);
}

.cta:active {
  transform: scale(0.98);
}

.cta:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.cta__icon {
  display: grid;
  place-items: center;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 50%;
  background: rgb(26 29 20 / 12%);
  transition: transform 420ms var(--ease);
}

.hero__stage-kicker {
  margin: 0 0 1.1rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.hero__toggle {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.4rem;
}

.dir {
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition:
    background 420ms var(--ease),
    color 420ms var(--ease),
    transform 280ms var(--ease);
}

.dir:hover {
  color: var(--ink);
}

.dir:active {
  transform: scale(0.98);
}

.dir[aria-pressed='true'] {
  background: var(--ink);
  border-color: transparent;
  color: var(--bg);
}

.dir:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.bezel {
  padding: 0.4rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-shell);
  background: color-mix(in srgb, var(--bg-inset) 70%, transparent);
}

.bezel__core {
  padding: 1.5rem 1.35rem 1.4rem;
  border-radius: var(--radius-core);
  background: var(--bg-raised);
  box-shadow: inset 0 1px 1px rgb(255 255 255 / 12%);
}

.bezel--wide .bezel__core--mirror {
  padding: 2rem 1.5rem 2.2rem;
}

@media (min-width: 768px) {
  .bezel--wide .bezel__core--mirror {
    padding: 2.75rem 2.4rem 3rem;
  }
}

.define,
.positions,
.legend,
.join {
  padding: 4.5rem 0 1rem;
}

@media (min-width: 768px) {
  .define,
  .positions,
  .legend,
  .join,
  .mirror {
    padding-top: 6.5rem;
  }
}

.define h2,
.positions h2,
.legend h2,
.mirror h2,
.join h2 {
  margin: 0 0 0.9rem;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.15;
  text-wrap: balance;
}

.define p,
.positions__lead,
.mirror p,
.join p {
  margin: 0;
  max-width: 62ch;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.65;
}

.positions__lead {
  margin-bottom: 2.25rem;
}

.positions__list {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pos {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1.1rem 1rem;
  border-radius: var(--radius-core);
}

.pos:nth-child(1) {
  background: color-mix(in srgb, var(--tone) 16%, var(--bg-raised));
}

.pos:nth-child(2) {
  background: var(--bg-raised);
}

.pos:nth-child(3) {
  background: color-mix(in srgb, var(--semitone) 16%, var(--bg-raised));
}

.pos__n {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.7rem;
  background: var(--bg-inset);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.pos h3 {
  margin: 0 0 0.55rem;
  font-size: 1.05rem;
  font-weight: 600;
}

.legend__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin: 1.5rem 0 0;
}

@media (min-width: 768px) {
  .legend__row {
    grid-template-columns: auto auto auto;
    justify-content: start;
    gap: 3rem;
  }
}

.legend__row dt {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 600;
}

.legend__row dd {
  margin: 0.25rem 0 0 1.7rem;
  color: var(--muted);
}

.swatch {
  display: inline-block;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  box-shadow: inset 0 1px 1px rgb(255 255 255 / 28%);
}

.swatch--tone {
  background: var(--tone);
}

.swatch--semi {
  background: var(--semitone);
}

.swatch--tc {
  background: var(--tc);
}

.swatch--lg {
  width: 1.15rem;
  height: 1.15rem;
  flex: none;
}

.mirror__pair {
  display: grid;
  gap: 1.75rem;
  margin-top: 1.75rem;
}

@media (min-width: 768px) {
  .mirror__pair {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
}

.mirror__pair figure {
  margin: 0;
}

.mirror__pair figcaption {
  margin-bottom: 0.7rem;
  font-size: 0.92rem;
  font-weight: 600;
}

.join__track {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: center;
  margin-top: 2rem;
  padding: 1.4rem 1rem;
  border-radius: var(--radius-core);
  background: var(--bg-raised);
}

@media (min-width: 768px) {
  .join__track {
    gap: 1.25rem;
    padding: 1.8rem 1.6rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .hero__copy,
  .hero__stage,
  .define,
  .positions,
  .legend,
  .mirror,
  .join {
    animation: rise 900ms var(--ease) both;
    animation-timeline: view();
    animation-range: entry 0% entry 35%;
  }

  .hero__copy,
  .hero__stage {
    animation-timeline: auto;
  }

  .hero__stage {
    animation-delay: 90ms;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(1.4rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

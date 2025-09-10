<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWeatherStore } from './store/weatherStore'
import { geocode } from './api/geocode'
import { iconPathFor } from './utils/tomorrowIcon'

const wx = useWeatherStore()
const location = ref('Amsterdam')
const uiError = ref<string | null>(null)

// Default (Amsterdam) bij opstart
const DEFAULT = { lat: 52.37, lon: 4.90, label: 'Amsterdam, Netherlands' }

// Huidig icoon
const iconSrcCurrent = computed(() =>
  iconPathFor(
    wx.current?.values?.weatherCode as number | undefined,
    wx.current?.time as string | undefined
  )
)

// Forecast (5 dagen)
const days = computed(() => (wx.daily ?? []).slice(0, 5))

function dayLabel(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString([], { weekday: 'short' })
}

function fmtTemp(v?: number | null) {
  return v == null ? '—' : `${Math.round(v)}°`
}

// UI strings zodat we geen TS casts in de template hebben
const tempNow = computed(() => Math.round((wx.current?.values?.temperature as number) ?? 0))
const feelsText = computed(() => fmtTemp(wx.current?.values?.temperatureApparent as number))
const humidityText = computed(() => (wx.current?.values?.humidity as number | undefined) ?? '—')
const windKmh = computed(() => {
  const ms = (wx.current?.values?.windSpeed as number | undefined) ?? 0
  return Math.round(ms * 3.6)
})

async function load() {
  uiError.value = null
  const q = location.value.trim()
  if (!q) {
    uiError.value = 'Vul een plaats in (bv. "Heerenveen, Friesland").'
    return
  }
  try {
    const coords = await geocode(q)
    if (!coords) {
      uiError.value = `Kon "${q}" niet vinden. Probeer een andere schrijfwijze.`
      return
    }
    await wx.load({ lat: coords.lat, lon: coords.lon, label: coords.label })
  } catch (e: any) {
    uiError.value = e?.message ?? 'Er ging iets mis bij het laden.'
  }
}

// Laad Amsterdam direct bij starten
onMounted(async () => {
  await wx.load(DEFAULT)
})
</script>

<template>
  <main class="app">
    <h1 class="title">Weather Widget</h1>

    <!-- PHONE-LIKE WIDGET -->
    <section class="widget">
      <header class="widget-header">
        <!-- Zoekbalk in de header -->
        <form class="searchbar" @submit.prevent="load">
          <input
            v-model="location"
            class="input"
            placeholder="Zoek plaats (bv. Heerenveen, Friesland)"
            aria-label="Zoek locatie"
          />
          <button class="btn" type="submit" :disabled="wx.loading">
            {{ wx.loading ? 'Loading…' : 'Load' }}
          </button>
        </form>

        <!-- Locatie + current -->
        <div class="place">{{ wx.location?.label || 'Location' }}</div>

        <div class="now">
          <img :src="iconSrcCurrent" alt="" width="56" height="56" />
          <div class="temp">{{ tempNow }}°</div>
        </div>

        <!-- Meta: v-if / v-else, geen slot-syntax -->
        <div class="meta" v-if="wx.current">
          Feels {{ feelsText }} · Humidity {{ humidityText }}% · Wind {{ windKmh }} km/h
        </div>
        <div class="meta" v-else>Loading…</div>
      </header>

      <!-- Fouten in de widget -->
      <p v-if="uiError" class="error in-widget">{{ uiError }}</p>
      <p v-else-if="wx.error" class="error in-widget">Error: {{ wx.error }}</p>

      <!-- Forecast -->
      <div class="widget-forecast" v-if="days.length">
        <div class="day" v-for="(d, i) in days" :key="i">
          <div class="label">{{ dayLabel(d.time) }}</div>
          <img
            :src="iconPathFor(d.values?.weatherCode as number | undefined, d.time)"
            alt=""
            width="36"
            height="36"
          />
          <div class="temps">
            <span class="t t-max">{{ fmtTemp(d.values?.temperature as number) }}</span>
            <span class="t t-pop">{{ (d.values?.precipitationProbability ?? '—') }}%</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
:root {
  --bg: #0f1115;
  --fg: #ffffff;
  --muted: #bfc3c8;
  --panel-1: #1a1f2b;
  --panel-2: #0d1015;
  --border: #1e2430;
  --btn: #2444ff;
  --btn-hover: #1d37d6;
  --error-bg: #2a1c1c;
  --error-fg: #ffb3b3;
  --glow: 0 10px 30px rgba(36, 68, 255, .18);
}

.app {
  max-width: 920px;
  margin: 2rem auto;
  padding: 0 1rem 2rem;
  color: var(--fg);
  background: var(--bg);
}

.title {
  margin: 0 0 1rem 0;
  font-size: clamp(2rem, 3vw + 1rem, 3.25rem);
  font-weight: 800;
  letter-spacing: 0.02em;
  text-align: center;
}

/* Widget shell */
.widget {
  border-radius: 26px;
  overflow: hidden;
  background: linear-gradient(180deg, var(--panel-1) 0%, #0e1117 100%);
  border: 1px solid var(--border);
  box-shadow: 0 20px 50px rgba(0,0,0,.35);
  max-width: 520px;
  margin: 0 auto;
}

.widget-header {
  padding: .9rem .9rem .6rem;
  background: radial-gradient(120% 120% at 10% 0%, #26314a 0%, #141823 60%);
  border-bottom: 1px solid var(--border);
}

/* Search in header */
.searchbar {
  display: flex;
  gap: .5rem;
  align-items: center;
  margin: 0 0 .55rem;
}
.input {
  flex: 1;
  padding: .6rem .7rem;
  border-radius: 12px;
  border: 1px solid #2a2d33;
  background: #1a1c20;
  color: var(--fg);
  outline: none;
}
.input::placeholder { color: #7b8088; }
.input:focus-visible { box-shadow: 0 0 0 3px rgba(98,160,255,.45); border-color: transparent; }
.btn {
  padding: .65rem .9rem;
  border: 0;
  border-radius: 12px;
  background: var(--btn);
  color: white;
  cursor: pointer;
  transition: transform .02s ease, background .15s ease, box-shadow .15s ease;
  box-shadow: var(--glow);
}
.btn:hover { background: var(--btn-hover); }
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: .6; cursor: not-allowed; box-shadow: none; }

.place {
  font-weight: 700;
  text-align: center;
  margin-bottom: .25rem;
}

.now {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .75rem;
}

.temp {
  font-size: clamp(2.6rem, 7vw, 3.5rem);
  margin: 0;
  line-height: 1;
}

.meta {
  color: var(--muted);
  text-align: center;
  margin-top: .35rem;
  font-size: .95rem;
}

/* Error inline */
.error.in-widget {
  margin: .6rem .75rem 0;
  background: var(--error-bg);
  color: var(--error-fg);
  border: 1px solid #8b2a2a;
  padding: .6rem .7rem;
  border-radius: 12px;
}

/* Forecast strip */
.widget-forecast {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: .6rem;
  padding: .75rem .75rem 1rem;
  background: var(--panel-2);
  border-top: 1px solid var(--border);
}
.day {
  background: #141823;
  border: 1px solid #1f2633;
  border-radius: 16px;
  padding: .6rem .5rem;
  text-align: center;
}
.label {
  color: var(--muted);
  font-size: .85rem;
  margin-bottom: .25rem;
}
.temps {
  display: flex;
  justify-content: center;
  gap: .45rem;
  margin-top: .25rem;
}
.t { font-weight: 600; }
.t-pop { color: #8fb3ff; } /* neerslagkans accent */

@media (max-width: 520px) {
  .widget-forecast { grid-template-columns: repeat(3, 1fr); }
}
</style>

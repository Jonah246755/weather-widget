import { defineStore } from 'pinia'
import { fetchTimelines } from '../api/weather'


type Units = 'metric' | 'imperial'
type Location = { lat: number; lon: number; label?: string }

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    location: null as Location | null,
    units: 'metric' as Units,
    current: null as any | null,
    hourly: [] as any[],
    daily: [] as any[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    setUnits(u: Units) { this.units = u },
    async load(loc: Location) {
      this.location = loc
      this.loading = true
      this.error = null
      try {
        const timelines = await fetchTimelines({
          location: `${loc.lat},${loc.lon}`,
          units: this.units,
          timesteps: ['current', '1h', '1d']
        })
        this.current = timelines.find(t => t.timestep === 'current')?.intervals?.[0] ?? null
        this.hourly  = timelines.find(t => t.timestep === '1h')?.intervals ?? []
        this.daily   = timelines.find(t => t.timestep === '1d')?.intervals ?? []
      } catch (e: any) {
        this.error = e.message ?? 'Failed to load data'
      } finally {
        this.loading = false
      }
    }
  }
})

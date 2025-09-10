// src/api/weather.ts
import { api } from './client'
import { z } from 'zod'


const IntervalRaw = z.object({
  time: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  values: z.object({}).catchall(z.unknown()), 
})

const TimelineRaw = z.object({
  timestep: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  intervals: z.array(IntervalRaw),
})

const TimelinesResponseRaw = z.object({
  data: z.object({ timelines: z.array(TimelineRaw) })
})


export type Interval = { time: string; endTime?: string; values: Record<string, unknown> }
export type Timeline = { timestep: string; startTime: string; endTime: string; intervals: Interval[] }


function iso(dt: Date) { return dt.toISOString() }


function buildRange(timesteps: ('current'|'1h'|'1d')[]) {
  const now = new Date()
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000
  const CAP = new Date(now.getTime() + FIVE_DAYS_MS - 60 * 1000) 

  
  let end = new Date(now.getTime() + 60 * 1000)

  
  if (timesteps.includes('1h')) {
    end = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }


  if (timesteps.includes('1d')) {
    end = CAP
  }


  if (end.getTime() > CAP.getTime()) end = CAP

  return { startTime: now.toISOString(), endTime: end.toISOString() }
}



// ---- API call ----
export async function fetchTimelines(opts: {
  location: string                  
  timesteps: ('current'|'1h'|'1d')[]
  units?: 'metric'|'imperial'
}): Promise<Timeline[]> {
  const { startTime, endTime } = buildRange(opts.timesteps)

  const params = new URLSearchParams()
  params.set('location', opts.location)
  params.set('units', opts.units ?? 'metric')
  params.set('timezone', 'auto')

  
params.set('fields', [
  'temperature',
  'temperatureApparent',
  'humidity',
  'windSpeed',
  'weatherCode',
  'precipitationProbability'
].join(','))




  params.set('timesteps', opts.timesteps.join(','))
  params.set('startTime', startTime)
  params.set('endTime', endTime)

  const { data } = await api.get('', { params })

  const parsed = TimelinesResponseRaw.parse(data)
  const normalized: Timeline[] = parsed.data.timelines.map(t => ({
    timestep: t.timestep,
    startTime: t.startTime,
    endTime: t.endTime,
    intervals: t.intervals
      .map(i => ({
        time: i.time ?? i.startTime ?? '',
        endTime: i.endTime,
        values: i.values as Record<string, unknown>
      }))
      .filter(i => i.time) // vang eventuele lege gevallen af
  }))

  return normalized
}

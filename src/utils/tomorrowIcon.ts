// src/utils/tomorrowIcon.ts

/** Bepaal of het nacht is op basis van lokale tijd (ISO string). */
function isNight(iso?: string): boolean {
  if (!iso) return false
  const h = new Date(iso).getHours()
  return h >= 20 || h < 6 // Nacht tussen 20:00 en 06:00
}

/**
Bouwt pad naar icons, met onderscheid tussen dag en nacht.
 */
export function iconPathFor(code?: number, isoTime?: string, folder = '/icons') {
  if (!code) return `${folder}/10010.png` // fallback: kies een standaardbestand dat je hebt
  const suffix = isNight(isoTime) ? '1' : '0'
  return `${folder}/${code}${suffix}.png`
}

import type { TimezoneSignals } from '../../types'

// Maps IANA timezone prefix → broad region.
function regionFromTimezone(tz: string): string {
  if (tz.startsWith('America/'))                       return 'Americas'
  if (tz.startsWith('Europe/'))                        return 'Europe'
  if (tz.startsWith('Asia/'))                          return 'Asia'
  if (tz.startsWith('Africa/'))                        return 'Africa'
  if (tz.startsWith('Australia/') || tz.startsWith('Pacific/')) return 'Oceania'
  return 'Unknown'  // UTC, Etc/, or unrecognised
}

const AMERICAS = new Set(['US','CA','MX','BR','AR','CO','CL','PE','VE','EC','BO','PY','UY','CR','PA','GT','HN','SV','NI','CU','DO','PR'])
const EUROPE   = new Set(['GB','DE','FR','ES','IT','NL','PL','RU','SE','NO','DK','FI','BE','AT','CH','PT','GR','CZ','HU','RO','BG','HR','SK','SI','LT','LV','EE','IE','LU','MT','CY','UA','RS','BA','AL','MK','ME'])
const ASIA     = new Set(['CN','JP','KR','IN','ID','TH','VN','MY','PH','SG','TW','HK','BD','PK','LK','NP','MM','KH','LA','MN','KZ','UZ','AZ','GE','AM','IL','SA','AE','TR','IQ','IR','SY','JO','LB','KW','QA','BH','OM','YE'])
const AFRICA   = new Set(['ZA','NG','KE','EG','MA','GH','TZ','ET','SN','CI','CM','MG','MZ','ZM','ZW','RW','ML','BF','NE','SD','LY','TN','DZ'])
const OCEANIA  = new Set(['AU','NZ','FJ','PG','WS','TO','VU'])

function regionFromLanguage(lang: string): string {
  const country = lang.split('-')[1]?.toUpperCase()
  if (!country) return 'Unknown'
  if (AMERICAS.has(country)) return 'Americas'
  if (EUROPE.has(country))   return 'Europe'
  if (ASIA.has(country))     return 'Asia'
  if (AFRICA.has(country))   return 'Africa'
  if (OCEANIA.has(country))  return 'Oceania'
  return 'Unknown'
}

export function collectTimezoneSignal(): TimezoneSignals {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  const timezoneOffset = new Date().getTimezoneOffset()
  const language = navigator.language ?? ''
  const languages = Array.from(navigator.languages ?? [language])

  const tzRegion   = regionFromTimezone(timezone)
  const langRegion = regionFromLanguage(language)

  // Only flag as inconsistent when both sides are known — avoids FP on
  // unrecognised locales or UTC/Etc/ server-side timezone settings.
  const consistent =
    tzRegion === 'Unknown' || langRegion === 'Unknown' || tzRegion === langRegion

  return { timezone, timezoneOffset, language, languages, consistent }
}

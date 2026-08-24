export type AnalyticsEvent =
  | 'page_view'
  | 'try_modsync_clicked'
  | 'mod_search'
  | 'mod_viewed'
  | 'mod_added_to_library'
  | 'mod_removed_from_library'
  | 'dependency_detected'
  | 'dependency_added'
  | 'compatibility_check_started'
  | 'compatibility_check_completed'
  | 'compatibility_check_failed'
  | 'download_started'
  | 'download_completed'
  | 'download_failed'
  | 'download_all_started'
  | 'download_all_completed'
  | 'download_all_failed'
  | 'recommendations_viewed'
  | 'recommendation_added_to_library'
  | 'installation_plan_viewed'
  | 'installation_guide_viewed'
  | 'feedback_opened'
  | 'feedback_submitted'
  | 'support_opened'

export type AnalyticsProperties = Record<string, string | number | boolean>

type UmamiFunction = {
  track(event: string, properties?: AnalyticsProperties): void
}

declare global {
  interface Window {
    umami?: UmamiFunction
  }
}

const CONSENT_KEY = 'modsync-analytics-consent'
const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined
const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL as string | undefined

export function isAnalyticsConfigured() {
  return Boolean(websiteId && scriptUrl)
}

export function getAnalyticsConsent(): 'accepted' | 'declined' | null {
  const consent = localStorage.getItem(CONSENT_KEY)
  return consent === 'accepted' || consent === 'declined' ? consent : null
}

export function setAnalyticsConsent(consent: 'accepted' | 'declined') {
  localStorage.setItem(CONSENT_KEY, consent)
  if (consent === 'accepted') void loadUmami()
}

let loadPromise: Promise<void> | null = null

function loadUmami() {
  if (!isAnalyticsConfigured() || loadPromise) return loadPromise ?? Promise.resolve()
  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.async = true
    script.src = scriptUrl!
    script.dataset.websiteId = websiteId!
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })
  return loadPromise
}

export function initialiseAnalytics() {
  if (getAnalyticsConsent() === 'accepted') void loadUmami()
}

export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  if (!isAnalyticsConfigured() || getAnalyticsConsent() !== 'accepted') return
  try {
    window.umami?.track(event, properties)
  } catch {
    // Analytics must never affect the application.
  }
}

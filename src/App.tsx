import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  getAnalyticsConsent,
  initialiseAnalytics,
  isAnalyticsConfigured,
  setAnalyticsConsent,
  trackEvent,
} from './lib/analytics'

type MinecraftInstallation = {
  found: boolean
  minecraft_directory: string | null
  mods_directory: string | null
  versions_directory: string | null
}

type MinecraftVersion = {
  id: string
  type: 'release' | 'snapshot' | string
}

type ModrinthSearchHit = {
  project_id: string
  slug: string
  author: string
  title: string
  description: string
  icon_url?: string
  categories: string[]
  versions: string[]
  downloads?: number
  follows?: number
  date?: string
  modified?: string
}

type ModrinthProjectResponse = Omit<ModrinthSearchHit, 'project_id'> & {
  id: string
  project_id?: string
}

type ModrinthSearchResponse = {
  hits: ModrinthSearchHit[]
}

type RecommendationGroup = {
  title: string
  mods: ModrinthSearchHit[]
  personalized: boolean
}

type LandingPageProps = {
  onOpenApp: (view?: 'feedback' | 'support') => void
}

type AnalyticsConsentProps = {
  onOpenPrivacy?: () => void
}

function AnalyticsConsent({ onOpenPrivacy }: AnalyticsConsentProps) {
  const [visible, setVisible] = useState(() => isAnalyticsConfigured() && !getAnalyticsConsent())
  if (!visible) return null
  return (
    <aside className="analytics-consent" role="dialog" aria-label="Analytics consent">
      <strong>Help improve ModSync</strong>
      <p>Optional, privacy-conscious analytics measure feature usage. No messages, emails, usernames, IP addresses, or file contents are collected.</p>
      <div>
        <button type="button" onClick={() => { setAnalyticsConsent('accepted'); setVisible(false) }}>Allow analytics</button>
        <button type="button" className="secondary-button" onClick={() => { setAnalyticsConsent('declined'); setVisible(false) }}>Decline</button>
        {onOpenPrivacy ? <button type="button" className="text-button" onClick={onOpenPrivacy}>Privacy information</button> : <a href="#privacy">Privacy information</a>}
      </div>
    </aside>
  )
}

function LandingPage({ onOpenApp }: LandingPageProps) {
  useEffect(() => trackEvent('page_view', { page: 'landing' }), [])
  return (
    <main className="landing-page">
      <AnalyticsConsent />
      <nav className="landing-nav" aria-label="Landing page navigation">
        <a className="landing-brand" href="#top">ModSync</a>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </div>
        <button type="button" onClick={() => { trackEvent('try_modsync_clicked'); onOpenApp() }}>Try ModSync</button>
      </nav>

      <section className="landing-hero" id="top">
        <div className="landing-hero-copy">
          <span className="landing-kicker">Minecraft mod manager · Beta</span>
          <h1>Minecraft Mods.<br /><em>Simplified.</em></h1>
          <p>Find compatible mods, automatically resolve dependencies, and download everything you need.</p>
          <div className="landing-actions">
            <button type="button" onClick={() => { trackEvent('try_modsync_clicked'); onOpenApp() }}>Try ModSync <span aria-hidden="true">-&gt;</span></button>
            <a className="landing-secondary-action" href="https://github.com/KingJan13/modsync" target="_blank" rel="noreferrer">View on GitHub</a>
          </div>
          <span className="landing-note">Works in your browser · No account required</span>
        </div>
        <div className="landing-hero-visual" aria-label="ModSync application preview">
          <div className="preview-window-bar"><span /><span /><span /><strong>modsync</strong></div>
          <div className="preview-content">
            <div className="preview-sidebar"><b>MS</b><span className="active" /><span /><span /><span /></div>
            <div className="preview-main">
              <div className="preview-heading"><span>MY LIBRARY</span><b>Installation Plan</b><small>26.2 · Fabric</small></div>
              <div className="preview-summary"><div><small>MODS</small><b>3</b></div><div><small>DEPENDENCIES</small><b>0</b></div><div><small>STATUS</small><b className="preview-ready">Ready</b></div></div>
              <div className="preview-files"><div><i>S</i><span>Sodium<small>sodium-fabric-0.9.2.jar</small></span><b>Ready</b></div><div><i>L</i><span>Litematica<small>litematica-fabric-26.2.jar</small></span><b>Ready</b></div><div><i>M</i><span>MaLiLib<small>malilib-fabric-26.2.jar</small></span><b>Ready</b></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-section-heading"><span className="landing-kicker">Everything in one place</span><h2>Less hunting.<br /><em>More playing.</em></h2></div>
        <div className="feature-grid">
          <article><span className="feature-icon">01</span><h3>Find Mods</h3><p>Search and discover Minecraft mods from Modrinth.</p></article>
          <article><span className="feature-icon">02</span><h3>Automatic Dependencies</h3><p>Automatically detect required dependencies.</p></article>
          <article><span className="feature-icon">03</span><h3>Compatibility Checking</h3><p>Check mods against your selected version and loader.</p></article>
          <article><span className="feature-icon">04</span><h3>Download All</h3><p>Download compatible mods and dependencies together.</p></article>
          <article><span className="feature-icon">05</span><h3>Recommendations</h3><p>Get suggestions based on the mods in your Library.</p></article>
          <article><span className="feature-icon">06</span><h3>Installation Guide</h3><p>Follow clear browser-mode instructions for manual installation.</p></article>
        </div>
      </section>

      <section className="landing-section how-section" id="how-it-works">
        <div className="landing-section-heading"><span className="landing-kicker">A clear path to your setup</span><h2>From idea to<br /><em>in-game.</em></h2></div>
        <ol className="steps-list"><li><b>01</b><span><strong>Find your mods</strong><small>Explore Modrinth through Search and Discover.</small></span></li><li><b>02</b><span><strong>Build your Library</strong><small>Add the mods you want to play with.</small></span></li><li><b>03</b><span><strong>Check your setup</strong><small>ModSync checks compatibility and dependencies.</small></span></li><li><b>04</b><span><strong>Download and install</strong><small>Download your files and follow the guide.</small></span></li></ol>
      </section>

      <section className="landing-section browser-section">
        <div><span className="landing-kicker">Built for the beta</span><h2>Everything you need<br /><em>in the browser.</em></h2><p>Manage your mods, resolve dependencies, and download compatible files without leaving your browser.</p><button type="button" onClick={() => { trackEvent('try_modsync_clicked'); onOpenApp() }}>Try ModSync <span aria-hidden="true">-&gt;</span></button></div>
        <div className="browser-columns"><div><span>Browser version</span><ul><li>Search mods</li><li>Manage your Library</li><li>Check compatibility</li><li>Resolve dependencies</li><li>Download mods</li><li>Follow the Installation Guide</li></ul></div><div className="planned"><span>Desktop version</span><p>Automatic installation into <code>.minecraft</code> is planned, but is not available in the browser beta.</p></div></div>
      </section>

      <section className="landing-section beta-section"><div><span className="landing-kicker">Help shape ModSync</span><h2>ModSync is currently<br /><em>in beta.</em></h2></div><div><p>We're actively improving ModSync. Feedback and bug reports help shape the next versions.</p><button type="button" onClick={() => onOpenApp('feedback')}>Give Feedback <span aria-hidden="true">-&gt;</span></button></div></section>

      <section className="landing-section faq-section" id="faq"><div className="landing-section-heading"><span className="landing-kicker">Questions, answered</span><h2>Good to<br /><em>know.</em></h2></div><div className="landing-faq"><details open><summary>What is ModSync?</summary><p>ModSync helps you find Minecraft mods, check compatibility, resolve required dependencies, and download the files you need.</p></details><details><summary>Where do the mods come from?</summary><p>ModSync searches Modrinth and uses its project and version data.</p></details><details><summary>Does ModSync automatically install mods?</summary><p>No. In browser mode, your browser downloads the files and you move them into your Minecraft mods folder using the Installation Guide.</p></details><details><summary>How do dependencies work?</summary><p>Required dependencies are detected from the selected mod versions and checked against your current Library.</p></details><details><summary>What Minecraft versions are supported?</summary><p>ModSync uses the current release versions listed by Minecraft and checks each mod against your selected version and loader.</p></details><details><summary>Is ModSync free?</summary><p>Yes. ModSync is currently a free beta project.</p></details></div></section>

      <footer className="landing-footer"><a className="landing-brand" href="#top">ModSync</a><div><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#faq">FAQ</a><a href="#privacy">Privacy</a><button type="button" onClick={() => { trackEvent('try_modsync_clicked'); onOpenApp() }}>Open app</button></div><small>Powered by Modrinth · Currently in beta</small></footer>
      <section className="landing-privacy" id="privacy"><h2>Privacy information</h2><p>With consent, ModSync uses Umami Cloud to measure page views and feature actions. Analytics excludes personal messages, emails, usernames, IP addresses, search text, file contents, and precise location. Decline analytics at any time by clearing the site data and choosing Decline again.</p></section>
    </main>
  )
}

function getRecommendationScore(mod: ModrinthSearchHit, library: ModrinthSearchHit[], result?: CompatibilityResult) {
  const libraryIds = new Set(library.map((item) => item.project_id))
  const libraryCategories = new Set(library.flatMap((item) => item.categories))
  const categoryMatches = mod.categories.filter((category) => libraryCategories.has(category)).length
  const libraryTerms = library.flatMap((item) => `${item.title} ${item.slug}`.toLowerCase().split(/[^a-z0-9]+/))
  const text = `${mod.title} ${mod.slug} ${mod.description}`.toLowerCase()
  const textMatches = libraryTerms.filter((term) => term.length > 3 && text.includes(term)).length
  const installedDependencyMatches = result?.requiredDependencies.filter((dependency) => libraryIds.has(dependency.projectId)).length ?? 0
  const popularity = Math.min(4, Math.log10((mod.downloads ?? 0) + 1) / 2)
  return categoryMatches * 8 + textMatches * 3 + installedDependencyMatches * 30 + popularity
}

function getRecommendationReason(mod: ModrinthSearchHit, library: ModrinthSearchHit[]) {
  const libraryCategories = new Set(library.flatMap((item) => item.categories))
  const matchingMod = library.find((item) => mod.categories.some((category) => item.categories.includes(category)))
  if (matchingMod) return `Works well with ${matchingMod.title}`
  if (mod.categories.some((category) => libraryCategories.has(category))) return 'Matches your current setup'
  return 'Popular with your current setup'
}

type ModrinthDependency = {
  project_id?: string
  version_id?: string
  file_name?: string
  dependency_type: 'required' | 'optional' | 'incompatible' | 'embedded'
}

type ModrinthFile = {
  filename: string
  primary: boolean
  size: number
  url: string
}

type ModrinthVersion = {
  id: string
  name: string
  version_number: string
  game_versions: string[]
  loaders: string[]
  dependencies: ModrinthDependency[]
  files: ModrinthFile[]
}

type DependencyEntry = {
  projectId: string
  title: string
  requiredBy: string
  reason: string
  version?: ModrinthVersion
  file?: ModrinthFile
  isRequired: boolean
  autoAdded: boolean
  error?: string
}

type CompatibilityResult = {
  status: 'compatible' | 'not-compatible' | 'update-available' | 'error'
  version?: ModrinthVersion
  dependencies: DependencyEntry[]
  missingDependencies: DependencyEntry[]
  requiredDependencies: DependencyEntry[]
  error?: string
}

type DownloadItem = {
  projectId: string
  title: string
  file: ModrinthFile
  isDependency: boolean
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: {
      invoke<T>(command: string): Promise<T>
    }
  }
}

const MINECRAFT_VERSION_MANIFEST =
  'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
const MODRINTH_SEARCH_API = 'https://api.modrinth.com/v2/search'
const MODRINTH_API = 'https://api.modrinth.com/v2'
const LOADERS = ['Fabric', 'Forge', 'NeoForge'] as const
const LOADER_CATEGORIES = {
  Fabric: 'fabric',
  Forge: 'forge',
  NeoForge: 'neoforge',
} as const
const LIBRARY_STORAGE_KEY = 'modsync-library'
const VERSION_STORAGE_KEY = 'modsync-minecraft-version'
const LOADER_STORAGE_KEY = 'modsync-loader'

function readLibrary(): ModrinthSearchHit[] {
  try {
    const stored = localStorage.getItem(LIBRARY_STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return []
      const project = entry as Partial<ModrinthProjectResponse>
      const projectId = project.project_id ?? project.id
      return projectId ? [{ ...project, project_id: projectId } as ModrinthSearchHit] : []
    })
  } catch {
    return []
  }
}

function readStoredLoader(): (typeof LOADERS)[number] {
  const stored = localStorage.getItem(LOADER_STORAGE_KEY)
  return LOADERS.includes(stored as (typeof LOADERS)[number])
    ? (stored as (typeof LOADERS)[number])
    : 'Fabric'
}

function getJarFile(version: ModrinthVersion): ModrinthFile | undefined {
  return version.files.find(
    (file) => file.primary && file.filename.toLowerCase().endsWith('.jar'),
  ) ?? version.files.find((file) => file.filename.toLowerCase().endsWith('.jar'))
}

function deduplicateDependencyEntries(entries: DependencyEntry[]): DependencyEntry[] {
  const map = new Map<string, DependencyEntry>()

  for (const entry of entries) {
    const existing = map.get(entry.projectId)
    if (!existing) {
      map.set(entry.projectId, entry)
      continue
    }

    if (existing.reason === entry.reason) {
      continue
    }

    map.set(entry.projectId, {
      ...existing,
      reason: `${existing.reason}; ${entry.reason}`,
      requiredBy: existing.requiredBy || entry.requiredBy,
    })
  }

  return [...map.values()]
}

async function fetchCompatibleVersion(
  projectId: string,
  selectedVersion: string,
  loader: string,
): Promise<ModrinthVersion | null> {
  const response = await fetch(`${MODRINTH_API}/project/${projectId}/version`)
  if (!response.ok) {
    return null
  }

  const versions = (await response.json()) as ModrinthVersion[]
  return (
    versions.find(
      (version) =>
        version.game_versions.includes(selectedVersion) && version.loaders.includes(loader),
    ) ?? null
  )
}

async function resolveProjectIdForDependency(
  dependency: ModrinthDependency,
): Promise<string | null> {
  if (dependency.project_id) {
    return dependency.project_id
  }

  if (!dependency.version_id) {
    return null
  }

  const dependencyResponse = await fetch(`${MODRINTH_API}/version/${dependency.version_id}`)
  if (!dependencyResponse.ok) {
    return null
  }

  const dependencyVersion = (await dependencyResponse.json()) as { project_id?: string }
  return dependencyVersion.project_id ?? null
}

function App() {
  const [versions, setVersions] = useState<MinecraftVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState(() =>
    localStorage.getItem(VERSION_STORAGE_KEY) ?? '',
  )
  const [selectedLoader, setSelectedLoader] = useState<(typeof LOADERS)[number]>(() =>
    readStoredLoader(),
  )
  const [query, setQuery] = useState('Sodium')
  const [submittedQuery, setSubmittedQuery] = useState('Sodium')
  const [mods, setMods] = useState<ModrinthSearchHit[]>([])
  const [isLoadingVersions, setIsLoadingVersions] = useState(true)
  const [isLoadingMods, setIsLoadingMods] = useState(false)
  const [error, setError] = useState('')
  const [library, setLibrary] = useState<ModrinthSearchHit[]>(readLibrary)
  const [libraryFeedback, setLibraryFeedback] = useState('')
  const [activeView, setActiveView] = useState<'discover' | 'recommendations' | 'search' | 'library' | 'plan' | 'feedback' | 'support' | 'privacy'>('discover')
  const [feedbackType, setFeedbackType] = useState('Bug report')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState('')
  const [showLanding, setShowLanding] = useState(() =>
    window.location.hash !== '#app' && localStorage.getItem('modsync-landing-seen') !== 'true',
  )
  const [recommendationGroups, setRecommendationGroups] = useState<RecommendationGroup[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendationError, setRecommendationError] = useState('')
  const [recommendationRefresh, setRecommendationRefresh] = useState(0)
  const [selectedMod, setSelectedMod] = useState<ModrinthSearchHit | null>(null)
  const [compatibility, setCompatibility] = useState<Record<string, CompatibilityResult>>({})
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false)
  const [compatibilityError, setCompatibilityError] = useState('')
  const [downloadStates, setDownloadStates] = useState<Record<string, 'downloading' | 'success' | 'error'>>({})
  const [downloadError, setDownloadError] = useState('')
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null)
  const [showInstallationGuide, setShowInstallationGuide] = useState(false)
  const [minecraftInstallation, setMinecraftInstallation] = useState<MinecraftInstallation | null>(null)
  const [isDetectingMinecraft, setIsDetectingMinecraft] = useState(false)
  const [minecraftDetectionError, setMinecraftDetectionError] = useState('')
  const isDesktopApp = Boolean(window.__TAURI_INTERNALS__)
  const activeLoader = LOADER_CATEGORIES[selectedLoader]

  function openApp(view?: 'feedback' | 'support') {
    localStorage.setItem('modsync-landing-seen', 'true')
    window.history.replaceState(null, '', '#app')
    setShowLanding(false)
    if (view) setActiveView(view)
  }

  function openFeedback(type = 'Bug report') {
    setFeedbackType(type)
    setFeedbackStatus('')
    setActiveView('feedback')
    trackEvent('feedback_opened', { type: type.toLowerCase().replaceAll(' ', '_') })
  }

  function openInstallationGuide() {
    setShowInstallationGuide(true)
    trackEvent('installation_guide_viewed', { loader: selectedLoader, minecraft_version: selectedVersion })
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!feedbackMessage.trim()) {
      setFeedbackStatus('Please enter a message before exporting your feedback.')
      return
    }

    const report = [
      'ModSync beta feedback',
      `Type: ${feedbackType}`,
      `Message: ${feedbackMessage.trim()}`,
      feedbackEmail.trim() ? `Email: ${feedbackEmail.trim()}` : 'Email: not provided',
      '',
      'Technical context:',
      `Minecraft: ${selectedVersion || 'not selected'}`,
      `Loader: ${selectedLoader}`,
      `Mode: ${isDesktopApp ? 'Tauri desktop app' : 'Browser'}`,
      `Browser: ${navigator.userAgent}`,
    ].join('\n')
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `modsync-feedback-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setFeedbackStatus('Your feedback was exported locally. It was not sent to a server.')
    trackEvent('feedback_submitted', { type: feedbackType.toLowerCase().replaceAll(' ', '_') })
  }

  useEffect(() => {
    initialiseAnalytics()
  }, [])

  useEffect(() => {
    if (showLanding) return
    const page = activeView === 'plan' ? 'installation_plan' : activeView
    trackEvent('page_view', { page })
    if (activeView === 'recommendations') trackEvent('recommendations_viewed')
    if (activeView === 'plan') trackEvent('installation_plan_viewed')
    if (activeView === 'support') trackEvent('support_opened')
  }, [activeView, showLanding])

  useEffect(() => {
    const controller = new AbortController()

    async function loadVersions() {
      try {
        const response = await fetch(MINECRAFT_VERSION_MANIFEST, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Minecraft-Versionen konnten nicht geladen werden.')
        }

        const data: { versions: MinecraftVersion[] } = await response.json()
        const releases = data.versions.filter((version) => version.type === 'release')
        setVersions(releases)
        setSelectedVersion((current) =>
          releases.some((version) => version.id === current) ? current : releases[0]?.id || '',
        )
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return
        }
        setError('Minecraft-Versionen konnten nicht geladen werden.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingVersions(false)
        }
      }
    }

    void loadVersions()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (selectedVersion) localStorage.setItem(VERSION_STORAGE_KEY, selectedVersion)
  }, [selectedVersion])

  useEffect(() => {
    localStorage.setItem(LOADER_STORAGE_KEY, selectedLoader)
  }, [selectedLoader])

  useEffect(() => {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library))
  }, [library])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!query.trim()) {
      setMods([])
    }
    setSubmittedQuery(query)
    trackEvent('mod_search', { loader: selectedLoader, minecraft_version: selectedVersion })
  }

  const isProjectInLibrary = useCallback(
    (projectId: string) => library.some((mod) => mod.project_id === projectId),
    [library],
  )

  function getMissingDependencies(result: CompatibilityResult) {
    return result.requiredDependencies.filter((dependency) => !isProjectInLibrary(dependency.projectId))
  }

  function addToLibrary(mod: ModrinthSearchHit) {
    if (isProjectInLibrary(mod.project_id)) {
      return
    }

    setLibrary((current) => [...current, mod])
    setLibraryFeedback(`${mod.title} wurde zu My Library hinzugefügt.`)
    trackEvent('mod_added_to_library', { loader: selectedLoader, minecraft_version: selectedVersion })
  }

  function addRecommendationToLibrary(mod: ModrinthSearchHit) {
    if (isProjectInLibrary(mod.project_id)) return
    addToLibrary(mod)
    trackEvent('recommendation_added_to_library', { loader: selectedLoader, minecraft_version: selectedVersion })
    const result = compatibility[mod.project_id]
    if (result?.requiredDependencies.length) {
      void addDependenciesToLibrary(result.requiredDependencies)
    }
  }

  function viewMod(mod: ModrinthSearchHit) {
    setSelectedMod(mod)
    trackEvent('mod_viewed', { loader: selectedLoader, minecraft_version: selectedVersion })
  }

  async function addDependenciesToLibrary(dependencies: DependencyEntry[]) {
    const compatibleDependencies = dependencies.filter((dependency) => dependency.version)
    const newDependencies = compatibleDependencies.filter(
      (dependency) => !isProjectInLibrary(dependency.projectId),
    )

    if (newDependencies.length === 0) {
      setLibraryFeedback('Alle kompatiblen Dependencies sind bereits in My Library.')
      return
    }

    try {
      const projects = await Promise.all(
        newDependencies.map((dependency) => fetchProject(dependency.projectId)),
      )
      const projectsToAdd = projects.filter(
        (project, index, allProjects) =>
          allProjects.findIndex((item) => item.project_id === project.project_id) === index,
      )
        setLibrary((current) => {
          const existingIds = new Set(current.map((project) => project.project_id))
          return [...current, ...projectsToAdd.filter((project) => !existingIds.has(project.project_id))]
        })
      setLibraryFeedback(
        `${projectsToAdd.length} required ${projectsToAdd.length === 1 ? 'dependency' : 'dependencies'} added to My Library.`,
      )
      trackEvent('dependency_added', { count: projectsToAdd.length, loader: selectedLoader, minecraft_version: selectedVersion })
    } catch {
      setLibraryFeedback('Required dependencies could not be added. Please try again.')
    }
  }

  function removeFromLibrary(projectId: string) {
    setLibrary((current) =>
      current.filter((libraryMod) => libraryMod.project_id !== projectId),
    )
    trackEvent('mod_removed_from_library', { loader: selectedLoader, minecraft_version: selectedVersion })
  }

  async function fetchProject(projectId: string): Promise<ModrinthSearchHit> {
    const response = await fetch(`${MODRINTH_API}/project/${projectId}`)
    if (!response.ok) throw new Error('Projekt konnte nicht geladen werden.')
    const project = (await response.json()) as ModrinthProjectResponse
    return { ...project, project_id: project.id } as ModrinthSearchHit
  }

  const resolveDependencyTree = useCallback(
    async function resolveDependencyTree(
      mod: ModrinthSearchHit,
      requiredByName: string,
      visited: Set<string> = new Set(),
      libraryMods: ModrinthSearchHit[] = library,
    ): Promise<DependencyEntry[]> {
      if (visited.has(mod.project_id)) {
        return []
      }
      visited.add(mod.project_id)

      const compatibleVersion = await fetchCompatibleVersion(mod.project_id, selectedVersion, activeLoader)
      if (!compatibleVersion) {
        return []
      }

      const entries: DependencyEntry[] = []

      for (const dependency of compatibleVersion.dependencies.filter(
        (item) => item.dependency_type === 'required',
      )) {
        const dependencyProjectId = await resolveProjectIdForDependency(dependency)
        if (!dependencyProjectId) {
          continue
        }

        const dependencyProject = await fetchProject(dependencyProjectId)
        const dependencyVersion = await fetchCompatibleVersion(
          dependencyProjectId,
          selectedVersion,
          activeLoader,
        )
        const reason = `${requiredByName} requires ${dependencyProject.title}`
        const entry: DependencyEntry = {
          projectId: dependencyProjectId,
          title: dependencyProject.title,
          requiredBy: requiredByName,
          reason,
          version: dependencyVersion ?? undefined,
          file: dependencyVersion ? getJarFile(dependencyVersion) : undefined,
          isRequired: true,
          autoAdded: !libraryMods.some((libraryMod) => libraryMod.project_id === dependencyProjectId),
          error: dependencyVersion ? undefined : 'Incompatible with selected Minecraft version or loader.',
        }

        entries.push(entry)
        trackEvent('dependency_detected', { loader: selectedLoader, minecraft_version: selectedVersion })

        if (dependencyVersion && !visited.has(dependencyProjectId)) {
          const childEntries = await resolveDependencyTree(
            dependencyProject,
            dependencyProject.title,
            visited,
            libraryMods,
          )
          entries.push(...childEntries)
        }
      }

      return deduplicateDependencyEntries(entries)
    },
    [activeLoader, library, selectedLoader, selectedVersion],
  )

  const checkCompatibility = useCallback(
    async (targetMods: ModrinthSearchHit[] = library) => {
      if (!selectedVersion || targetMods.length === 0) return {}

      setIsCheckingCompatibility(true)
      setCompatibilityError('')
      trackEvent('compatibility_check_started', { loader: selectedLoader, minecraft_version: selectedVersion })
      try {
        const results = await Promise.all(
          targetMods.map(async (mod): Promise<[string, CompatibilityResult]> => {
            try {
              const compatibleVersion = await fetchCompatibleVersion(
                mod.project_id,
                selectedVersion,
                activeLoader,
              )

              if (!compatibleVersion) {
                return [mod.project_id, {
                  status: 'not-compatible',
                  dependencies: [],
                  missingDependencies: [],
                  requiredDependencies: [],
                }]
              }

              const requiredDependencies = await resolveDependencyTree(mod, mod.title)
              const missingDependencies = requiredDependencies.filter(
                (dependency) => !isProjectInLibrary(dependency.projectId),
              )

              return [mod.project_id, {
                status: 'compatible',
                version: compatibleVersion,
                dependencies: requiredDependencies,
                missingDependencies,
                requiredDependencies,
              }]
            } catch {
              return [mod.project_id, {
                status: 'error',
                dependencies: [],
                missingDependencies: [],
                requiredDependencies: [],
                error: 'API-Fehler',
              }]
            }
          }),
        )
        const resolvedResults = Object.fromEntries(results)
        setCompatibility((current) => ({ ...current, ...resolvedResults }))
        const compatibleCount = Object.values(resolvedResults).filter((result) => result.status === 'compatible').length
        trackEvent('compatibility_check_completed', {
          loader: selectedLoader,
          minecraft_version: selectedVersion,
          compatible_count: compatibleCount,
          incompatible_count: targetMods.length - compatibleCount,
          dependency_count: Object.values(resolvedResults).reduce((count, result) => count + result.requiredDependencies.length, 0),
        })
        return resolvedResults
      } catch {
        setCompatibilityError('Kompatibilitätsprüfung fehlgeschlagen. Bitte später erneut versuchen.')
        trackEvent('compatibility_check_failed', { loader: selectedLoader, minecraft_version: selectedVersion })
        return {}
      } finally {
        setIsCheckingCompatibility(false)
      }
    },
    [activeLoader, isProjectInLibrary, library, resolveDependencyTree, selectedLoader, selectedVersion],
  )

  useEffect(() => {
    if (!selectedVersion || !submittedQuery.trim()) {
      return
    }

    const controller = new AbortController()
    const facets = JSON.stringify([
      ['project_type:mod'],
      [`versions:${selectedVersion}`],
      [`categories:${activeLoader}`],
    ])
    const url = new URL(MODRINTH_SEARCH_API)
    url.searchParams.set('query', submittedQuery.trim())
    url.searchParams.set('facets', facets)
    url.searchParams.set('limit', '24')

    async function searchMods() {
      setIsLoadingMods(true)
      setError('')
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Modrinth-Suche fehlgeschlagen.')
        }
        const data: ModrinthSearchResponse = await response.json()
        setMods(data.hits)
        void checkCompatibility(data.hits)
      } catch (searchError) {
        if (searchError instanceof DOMException && searchError.name === 'AbortError') {
          return
        }
        setError('Modrinth-Suche fehlgeschlagen. Bitte später erneut versuchen.')
        setMods([])
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingMods(false)
        }
      }
    }

    void searchMods()
    return () => controller.abort()
  }, [activeLoader, checkCompatibility, selectedVersion, submittedQuery, selectedLoader])

  useEffect(() => {
    if (library.length === 0 || !selectedVersion) {
      return
    }

    const recalculation = window.setTimeout(() => void checkCompatibility(library), 0)
    return () => window.clearTimeout(recalculation)
  }, [checkCompatibility, library, selectedVersion, selectedLoader])

  const libraryDependencyKey = library.flatMap((mod) =>
    compatibility[mod.project_id]?.requiredDependencies.map((dependency) => dependency.projectId) ?? [],
  ).sort().join(',')

  useEffect(() => {
    if ((activeView !== 'discover' && activeView !== 'recommendations') || !selectedVersion) {
      return
    }

    const controller = new AbortController()
    const libraryDependencyIds = new Set(libraryDependencyKey ? libraryDependencyKey.split(',') : [])
    const libraryCategories = [...new Set(
      library.flatMap((mod) => mod.categories)
        .filter((category) => !Object.values(LOADER_CATEGORIES).includes(category as (typeof LOADER_CATEGORIES)[keyof typeof LOADER_CATEGORIES]))
        .slice(0, 3),
    )]
    const categories: Array<{ title: string; query: string; sort: string; personalized: boolean }> = activeView === 'recommendations' && library.length > 0
      ? [
          ...libraryCategories.map((category) => ({ title: 'Recommended for your setup', query: category, sort: 'downloads', personalized: true })),
          ...library.map((mod) => ({ title: 'Recommended for your setup', query: mod.slug, sort: 'downloads', personalized: true })),
          { title: 'More mods for your setup', query: '', sort: 'updated', personalized: false },
        ]
      : activeView === 'recommendations'
        ? [{ title: `Popular for Minecraft ${selectedVersion} ${selectedLoader}`, query: '', sort: 'downloads', personalized: false }]
        : [
            { title: 'Popular', query: '', sort: 'downloads', personalized: false },
            { title: 'Trending', query: '', sort: 'newest', personalized: false },
            { title: 'Recently updated', query: '', sort: 'updated', personalized: false },
            { title: 'Performance', query: 'performance', sort: 'downloads', personalized: false },
            { title: 'Building & Utilities', query: 'building utility schematic', sort: 'downloads', personalized: false },
            { title: 'Visuals', query: 'visual rendering shader', sort: 'downloads', personalized: false },
          ]
        let candidateProjectsBeforeFiltering = 0
        let removedFromLibrary = 0

    async function loadRecommendations() {
      setIsLoadingRecommendations(true)
      setRecommendationError('')
      setRecommendationGroups([])
      try {
        const results = await Promise.all(
          categories.map(async (category): Promise<RecommendationGroup> => {
            const facets = JSON.stringify([
              ['project_type:mod'],
              [`versions:${selectedVersion}`],
              [`categories:${activeLoader}`],
            ])
            const url = new URL(MODRINTH_SEARCH_API)
            if (category.query) url.searchParams.set('query', category.query)
            url.searchParams.set('facets', facets)
            url.searchParams.set('limit', '8')
            url.searchParams.set('index', category.sort)
            const response = await fetch(url, { signal: controller.signal })
            if (!response.ok) throw new Error('Recommendations could not be loaded.')
            const data: ModrinthSearchResponse = await response.json()
            candidateProjectsBeforeFiltering += data.hits.length
            removedFromLibrary += data.hits.filter((mod) => library.some((libraryMod) => libraryMod.project_id === mod.project_id)).length
            const filteredMods = data.hits.filter((mod) =>
              !library.some((libraryMod) => libraryMod.project_id === mod.project_id) &&
              !libraryDependencyIds.has(mod.project_id),
            )
            return {
              title: category.title,
              personalized: category.personalized ?? false,
              mods: filteredMods,
            }
          }),
        )
        const uniqueIds = new Set<string>()
        const candidateMods = results.flatMap((group) => group.mods)
        const uniqueCandidates = [...new Map(candidateMods.map((mod) => [mod.project_id, mod])).values()]
        const resolvedResults = await checkCompatibility(uniqueCandidates)
        const compatibleCandidates = uniqueCandidates.filter((mod) => {
          const result = resolvedResults[mod.project_id]
          return result?.status === 'compatible' && Boolean(result.version && getJarFile(result.version))
        })
        const personalizedCandidates = compatibleCandidates
          .filter((mod) => results.some((group) => group.personalized && group.mods.some((candidate) => candidate.project_id === mod.project_id)))
          .sort((left, right) => getRecommendationScore(right, library, resolvedResults[right.project_id]) - getRecommendationScore(left, library, resolvedResults[left.project_id]))
        const personalizedIds = new Set(personalizedCandidates.slice(0, 6).map((mod) => mod.project_id))
        const fallbackCandidates = compatibleCandidates
          .filter((mod) => !personalizedIds.has(mod.project_id) && results.some((group) => !group.personalized && group.mods.some((candidate) => candidate.project_id === mod.project_id)))
          .slice(0, Math.max(0, 6 - personalizedIds.size))
        const recommendationResults = activeView === 'recommendations' && library.length > 0
          ? [
              { title: 'Recommended for your setup', personalized: true, mods: personalizedCandidates.filter((mod) => personalizedIds.has(mod.project_id)) },
              { title: 'More mods for your setup', personalized: false, mods: fallbackCandidates },
            ]
          : results
        const uniqueGroups = recommendationResults
          .map((group) => ({
            ...group,
            mods: group.mods.filter((mod) => {
              if (uniqueIds.has(mod.project_id)) return false
              uniqueIds.add(mod.project_id)
              return true
            }),
          }))
          .filter((group) => group.mods.length > 0)
        setRecommendationGroups(uniqueGroups)
        console.info('[ModSync] recommendation pipeline', {
          libraryMods: library.length,
          candidateProjects: uniqueCandidates.length,
          candidatesBeforeFiltering: candidateProjectsBeforeFiltering,
          removedFromLibrary,
          duplicateProjects: candidateMods.length - uniqueCandidates.length,
          removedAsIncompatible: uniqueCandidates.length - compatibleCandidates.length,
          personalized: personalizedCandidates.length,
          fallback: fallbackCandidates.length,
          finalRecommendations: uniqueGroups.reduce((count, group) => count + group.mods.length, 0),
        })
      } catch (recommendationLoadError) {
        if (recommendationLoadError instanceof DOMException && recommendationLoadError.name === 'AbortError') {
          return
        }
        setRecommendationError('Recommendations could not be loaded. Please try again.')
        setRecommendationGroups([])
      } finally {
        if (!controller.signal.aborted) setIsLoadingRecommendations(false)
      }
    }

    void loadRecommendations()
    return () => controller.abort()
  }, [activeLoader, activeView, checkCompatibility, library, libraryDependencyKey, recommendationRefresh, selectedLoader, selectedVersion])

  function formatFileSize(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  async function downloadFile(item: DownloadItem): Promise<boolean> {
    setDownloadError('')
    setDownloadStates((current) => ({ ...current, [item.projectId]: 'downloading' }))
    trackEvent('download_started', { loader: selectedLoader, minecraft_version: selectedVersion })
    try {
      const response = await fetch(item.file.url)
      if (!response.ok) throw new Error('Download fehlgeschlagen.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = item.file.filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setDownloadStates((current) => ({ ...current, [item.projectId]: 'success' }))
      trackEvent('download_completed', { loader: selectedLoader, minecraft_version: selectedVersion })
      return true
    } catch {
      setDownloadStates((current) => ({ ...current, [item.projectId]: 'error' }))
      setDownloadError(`Download von ${item.title} fehlgeschlagen. Bitte erneut versuchen.`)
      trackEvent('download_failed', { loader: selectedLoader, minecraft_version: selectedVersion })
      return false
    }
  }

  function buildDownloadItems(sourceCompatibility: Record<string, CompatibilityResult>) {
    const planMap = new Map<string, DownloadItem>()
    for (const mod of library) {
      const result = sourceCompatibility[mod.project_id]
      const file = result?.version ? getJarFile(result.version) : undefined
      if (file) {
        planMap.set(mod.project_id, { projectId: mod.project_id, title: mod.title, file, isDependency: false })
      }
      for (const dependency of result?.requiredDependencies ?? []) {
        const dependencyFile = dependency.version ? getJarFile(dependency.version) : undefined
        if (!dependencyFile || planMap.has(dependency.projectId)) continue
        planMap.set(dependency.projectId, {
          projectId: dependency.projectId,
          title: dependency.title,
          file: dependencyFile,
          isDependency: true,
        })
      }
    }
    return [...planMap.values()]
  }

  async function downloadMod(mod: ModrinthSearchHit) {
    const result = compatibility[mod.project_id] ?? (await checkCompatibility([mod]))[mod.project_id]
    const file = result?.status === 'compatible' && result.version ? getJarFile(result.version) : undefined
    if (!file) {
      setDownloadError(`${mod.title}: No compatible version or .jar file found.`)
      return
    }
    await downloadFile({ projectId: mod.project_id, title: mod.title, file, isDependency: false })
  }

  async function downloadAll() {
    setDownloadError('')
    trackEvent('download_all_started', { loader: selectedLoader, minecraft_version: selectedVersion })
    const resolved = await checkCompatibility(library)
    const items = buildDownloadItems({ ...compatibility, ...resolved }).filter(
      (item) => downloadStates[item.projectId] !== 'success',
    )
    if (items.length === 0) {
      trackEvent('download_all_failed', { total_count: 0, successful_count: 0, failed_count: 0 })
      return
    }

    setDownloadProgress({ current: 0, total: items.length })
    let successfulCount = 0
    for (const [index, item] of items.entries()) {
      setDownloadProgress({ current: index + 1, total: items.length })
      if (await downloadFile(item)) successfulCount += 1
    }
    setDownloadProgress(null)
    const failedCount = items.length - successfulCount
    trackEvent(failedCount === 0 ? 'download_all_completed' : 'download_all_failed', {
      total_count: items.length,
      successful_count: successfulCount,
      failed_count: failedCount,
    })
  }

  async function detectMinecraft() {
    setIsDetectingMinecraft(true)
    setMinecraftDetectionError('')
    try {
      if (!window.__TAURI_INTERNALS__) {
        throw new Error('Desktop-App erforderlich')
      }
      const result = await window.__TAURI_INTERNALS__.invoke<MinecraftInstallation>('detect_minecraft')
      setMinecraftInstallation(result)
    } catch (detectionError) {
      setMinecraftDetectionError(
        detectionError instanceof Error && detectionError.message === 'Desktop-App erforderlich'
          ? 'Die Minecraft-Erkennung ist nur in der Tauri-Desktop-App verfügbar.'
          : 'Minecraft-Installation konnte nicht geprüft werden.',
      )
      setMinecraftInstallation(null)
    } finally {
      setIsDetectingMinecraft(false)
    }
  }

  const isSelectedModInLibrary = selectedMod ? isProjectInLibrary(selectedMod.project_id) : false
  const visibleMods = activeView === 'search' ? mods : library
  const versionGroups = versions.reduce<Record<string, MinecraftVersion[]>>(
    (groups, version) => {
      const groupName = version.id.split('.').slice(0, 2).join('.')
      groups[groupName] = [...(groups[groupName] ?? []), version]
      return groups
    },
    {},
  )

  const requiredDependencySet = new Set<string>()
  const unavailableSet = new Set<string>()
  for (const mod of library) {
    const result = compatibility[mod.project_id]
    if (!result || result.status === 'not-compatible' || result.status === 'error') {
      unavailableSet.add(mod.project_id)
      continue
    }
    if (result.version && !getJarFile(result.version)) {
      unavailableSet.add(mod.project_id)
    }
    for (const dependency of result.requiredDependencies) {
      if (!isProjectInLibrary(dependency.projectId)) {
        requiredDependencySet.add(dependency.projectId)
      }
      if (!dependency.version || !dependency.file) {
        unavailableSet.add(dependency.projectId)
      }
    }
  }

  const requiredDependencyCount = requiredDependencySet.size
  const unavailableCount = unavailableSet.size
  const libraryCompatibility = library.map((mod) => compatibility[mod.project_id])
  const readyToDownload = library.length > 0 &&
    libraryCompatibility.length === library.length &&
    unavailableCount === 0 &&
    libraryCompatibility.every((result) => result?.status === 'compatible')
  const libraryDependencies = deduplicateDependencyEntries(
    library.flatMap((mod) => compatibility[mod.project_id]?.requiredDependencies ?? []),
  )
  const missingLibraryDependencies = libraryDependencies.filter(
    (dependency) => !isProjectInLibrary(dependency.projectId),
  )
  const unavailableDependencies = libraryDependencies.filter(
    (dependency) =>
      !isProjectInLibrary(dependency.projectId) ||
      !dependency.version ||
      !dependency.file,
  )
  const downloadItems = buildDownloadItems(compatibility)
  const dependencyCount = downloadItems.filter((item) => item.isDependency).length

  if (showLanding) {
    return <LandingPage onOpenApp={openApp} />
  }

  return (
    <main className="app-shell">
      <AnalyticsConsent onOpenPrivacy={() => setActiveView('privacy')} />
      <header className="app-header">
        <div>
          <p className="eyebrow">ModSync</p>
          <h1>Minecraft-Mods finden</h1>
          <p className="subtitle">Durchsuche Modrinth für deine Version und deinen Loader.</p>
        </div>
        <span className="api-status">Live-Daten</span>
      </header>

      <nav className="main-nav" aria-label="Hauptnavigation">
        <button
          className={activeView === 'discover' ? 'nav-button active' : 'nav-button'}
          type="button"
          onClick={() => setActiveView('discover')}
        >
          Discover
        </button>
        <button
          className={activeView === 'recommendations' ? 'nav-button active' : 'nav-button'}
          type="button"
          onClick={() => setActiveView('recommendations')}
        >
          Recommendations
        </button>
        <button
          className={activeView === 'search' ? 'nav-button active' : 'nav-button'}
          type="button"
          onClick={() => setActiveView('search')}
        >
          Search
        </button>
        <button
          className={activeView === 'library' ? 'nav-button active' : 'nav-button'}
          type="button"
          onClick={() => setActiveView('library')}
        >
          My Library <span className="library-count">{library.length}</span>
        </button>
        <button
          className={activeView === 'plan' ? 'nav-button active' : 'nav-button'}
          type="button"
          onClick={() => setActiveView('plan')}
        >
          Installation Plan
        </button>
      </nav>

      <section className="installation-panel" aria-labelledby="minecraft-installation-title">
        <div className="section-heading">
          <h2 id="minecraft-installation-title">Minecraft Installation</h2>
          <button type="button" onClick={detectMinecraft} disabled={!isDesktopApp || isDetectingMinecraft}>
            {isDetectingMinecraft ? 'Prüfe ...' : 'Detect Minecraft'}
          </button>
        </div>
        {!isDesktopApp && (
          <p className="message">Minecraft-Erkennung ist nur in der Tauri-Desktop-App verfügbar.</p>
        )}
        {minecraftDetectionError && <p className="message error-message">{minecraftDetectionError}</p>}
        {minecraftInstallation && (
          <div className="installation-details">
            <strong>{minecraftInstallation.found ? '✓ Found' : '✗ Not found'}</strong>
            <span>Minecraft directory: {minecraftInstallation.minecraft_directory ?? 'Nicht vorhanden'}</span>
            <span>Mods folder: {minecraftInstallation.mods_directory ?? 'Nicht vorhanden'}</span>
            <span>Versions folder: {minecraftInstallation.versions_directory ?? 'Nicht vorhanden'}</span>
          </div>
        )}
      </section>

      {activeView === 'search' && (
        <section className="controls" aria-label="Suchfilter">
          <form className="search-form" onSubmit={handleSubmit}>
            <label htmlFor="mod-search">Mod suchen</label>
            <div className="search-row">
              <input
                id="mod-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zum Beispiel Sodium"
              />
              <button type="submit">Suchen</button>
            </div>
          </form>

          <div className="select-group">
            <label htmlFor="minecraft-version">Minecraft Java</label>
            <select
              id="minecraft-version"
              value={selectedVersion}
              onChange={(event) => {
                setCompatibility({})
                setSelectedVersion(event.target.value)
              }}
              disabled={isLoadingVersions || versions.length === 0}
            >
              {isLoadingVersions && <option>Versionen werden geladen ...</option>}
              {Object.entries(versionGroups).map(([groupName, groupVersions]) => (
                <optgroup key={groupName} label={`Minecraft ${groupName}`}>
                  {groupVersions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.id}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="mod-loader">Loader</label>
            <select
              id="mod-loader"
              value={selectedLoader}
              onChange={(event) => {
                setCompatibility({})
                setSelectedLoader(event.target.value as (typeof LOADERS)[number])
              }}
            >
              {LOADERS.map((loader) => (
                <option key={loader} value={loader}>
                  {loader}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {activeView === 'feedback' && (
        <section className="support-page" aria-labelledby="feedback-title">
          <div className="section-heading">
            <div>
              <h2 id="feedback-title">Feedback</h2>
              <p className="section-subtitle">ModSync is currently in beta. Your feedback helps us improve it.</p>
            </div>
          </div>
          <form className="feedback-form" onSubmit={submitFeedback}>
            <div className="select-group">
              <label htmlFor="feedback-type">Type</label>
              <select id="feedback-type" value={feedbackType} onChange={(event) => setFeedbackType(event.target.value)}>
                <option>Bug report</option>
                <option>Feature request</option>
                <option>General feedback</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="feedback-message">Message</label>
              <textarea id="feedback-message" value={feedbackMessage} onChange={(event) => setFeedbackMessage(event.target.value)} required rows={7} />
            </div>
            <div>
              <label htmlFor="feedback-email">Email (optional)</label>
              <input id="feedback-email" type="email" value={feedbackEmail} onChange={(event) => setFeedbackEmail(event.target.value)} placeholder="you@example.com" />
            </div>
            <p className="message">There is no feedback server connected yet. Export your message and send the file through the ModSync project channels.</p>
            <button type="submit">Export feedback</button>
            {feedbackStatus && <p className="message success-message" role="status">{feedbackStatus}</p>}
          </form>
        </section>
      )}

      {activeView === 'support' && (
        <section className="support-page" aria-labelledby="support-title">
          <div className="section-heading">
            <div>
              <h2 id="support-title">Support</h2>
              <p className="section-subtitle">Quick answers for the ModSync beta.</p>
            </div>
            <button type="button" onClick={openInstallationGuide}>Open Installation Guide</button>
          </div>
          <div className="support-list">
            <details open><summary>How do I download a mod?</summary><p>Open Search or Discover, select a compatible mod, and choose Download.</p></details>
            <details><summary>How do I download all mods?</summary><p>Open Installation Plan or My Library and choose Download all. Your browser may ask you to allow multiple downloads.</p></details>
            <details><summary>How do I install downloaded mods?</summary><p>Open the Installation Guide for the selected Minecraft version and loader.</p></details>
            <details><summary>Why is a mod incompatible?</summary><p>The mod has no compatible Modrinth version and downloadable JAR for the selected Minecraft version and loader.</p></details>
            <details><summary>What are dependencies?</summary><p>Dependencies are other mods required by a mod. ModSync resolves them from Modrinth and shows missing required projects.</p></details>
            <details><summary>Why can't ModSync install mods in the browser?</summary><p>Browsers cannot write into your Minecraft folders. Download the files, then move them into the mods folder yourself.</p></details>
            <details><summary>How do I use the Installation Guide?</summary><p>Choose Open Installation Guide above or use the guide links in Installation Plan.</p></details>
          </div>
          <button type="button" className="secondary-button" onClick={() => openFeedback('Bug report')}>Report a bug</button>
        </section>
      )}

      {activeView === 'privacy' && (
        <section className="support-page" aria-labelledby="privacy-title">
          <h2 id="privacy-title">Privacy information</h2>
          <p>With consent, ModSync uses Plausible to measure page views and feature actions. Analytics excludes personal messages, emails, usernames, IP addresses, search text, file contents, and precise location.</p>
          <p>Analytics is optional and disabled until you accept the notice. To change your choice, clear this site's stored data and reload ModSync.</p>
        </section>
      )}

      {(() => {
        return (
          <>
            {activeView === 'plan' && (
              <section className="installation-panel" aria-labelledby="plan-title">
                <div className="section-heading">
                  <h2 id="plan-title">Installation Plan</h2>
                  {library.length > 0 && (
                    <button
                      type="button"
                      onClick={() => void downloadAll()}
                      disabled={!readyToDownload || downloadProgress !== null || isCheckingCompatibility}
                    >
                      {downloadProgress ? `Downloading ${downloadProgress.current} / ${downloadProgress.total}` : `↓ Download all${downloadItems.length > 0 ? ` (${downloadItems.length})` : ''}`}
                    </button>
                  )}
                </div>

                <div className="installation-notice">
                  <strong>💡 Using ModSync in your browser?</strong>
                  <p>ModSync can download your mods, but the browser cannot automatically place them into your Minecraft mods folder.</p>
                  <button type="button" className="secondary-button" onClick={openInstallationGuide}>
                    View installation guide
                  </button>
                </div>

                <div className="setup-summary" aria-live="polite">
                  <div className="summary-item">
                    <span className="summary-label">Minecraft</span>
                    <strong>{selectedVersion}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Loader</span>
                    <strong>{selectedLoader}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Mods</span>
                    <strong>{library.length}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Required dependencies</span>
                    <strong>{requiredDependencyCount}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Unavailable</span>
                    <strong>{unavailableCount}</strong>
                  </div>
                  <div className={`summary-status ${readyToDownload ? 'ready' : 'action'}`}>
                    {readyToDownload ? '✓ Ready to download' : '⚠ Action required'}
                  </div>
                </div>

                <p className="message">
                  {downloadItems.length} files ready to download · {downloadItems.length - dependencyCount} Mods, {dependencyCount} Required dependencies, {unavailableCount} unavailable/incompatible
                </p>
                <div className="download-hint">
                  <span>After downloading, you'll need to move the .jar files into your Minecraft mods folder.</span>
                  <button type="button" className="text-button" onClick={openInstallationGuide}>
                    How to install
                  </button>
                </div>
                <p className="message">
                  Browser mode downloads the mod files to your computer. Automatic installation into .minecraft requires the future desktop version.
                </p>
                {downloadError && <p className="message error-message">{downloadError}</p>}
                {Object.values(downloadStates).some((state) => state === 'success') && (
                  <div className="download-success" role="status">
                    <strong>✓ Mods downloaded</strong>
                    <span>Next step: Move the downloaded .jar files into your Minecraft mods folder.</span>
                    <button type="button" onClick={openInstallationGuide}>
                      Step-by-step installation guide
                    </button>
                  </div>
                )}
                {downloadItems.length === 0 && (
                  <p className="message">Compatibility is being resolved automatically. Download all will be ready when compatible files are found.</p>
                )}
                {downloadProgress && (
                  <p className="message" role="status">Downloading {downloadProgress.current} / {downloadProgress.total}</p>
                )}
                {unavailableCount > 0 && (
                  <div className="plan-unavailable">
                    <h3>Unavailable or incompatible</h3>
                    {library.map((mod) => {
                      const result = compatibility[mod.project_id]
                      if (result?.status === 'compatible' && result.version && getJarFile(result.version)) {
                        return null
                      }
                      return (
                        <div className="plan-item unavailable" key={mod.project_id}>
                          <span>{mod.title}</span>
                          <span>{result?.status === 'error' ? result.error : 'No compatible file for the selected version or loader.'}</span>
                          <span>Not downloadable</span>
                        </div>
                      )
                    })}
                    {unavailableDependencies.map((dependency) => (
                      <div className="plan-item unavailable" key={dependency.projectId}>
                        <span>{dependency.title}</span>
                        <span>{dependency.reason}: {dependency.error ?? 'No compatible file available.'}</span>
                        <span>Required dependency</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="plan-list">
                  {downloadItems.map((item) => (
                    <div className="plan-item" key={item.projectId}>
                      <span>
                        {item.title}
                        {item.isDependency ? ' • Required dependency' : ''}
                      </span>
                      <span>{item.file.filename}</span>
                      <button
                        type="button"
                        onClick={() => void downloadFile(item)}
                        disabled={downloadStates[item.projectId] === 'downloading'}
                      >
                        {downloadStates[item.projectId] === 'downloading'
                          ? 'Downloading ...'
                          : downloadStates[item.projectId] === 'success'
                            ? 'Downloaded'
                            : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )
      })()}

      {!['plan', 'feedback', 'support', 'privacy'].includes(activeView) && (
        <section className="results" aria-live="polite">
          <div className="section-heading">
            <div>
              <h2>{activeView === 'search' ? 'Search' : activeView === 'discover' ? 'Discover' : activeView === 'recommendations' ? 'Recommendations' : 'My Library'}</h2>
              {(activeView === 'discover' || activeView === 'recommendations') && (
                <p className="section-subtitle">
                  {activeView === 'discover' ? 'Explore popular and interesting Minecraft mods.' : 'Mods selected for your current setup.'}
                </p>
              )}
            </div>
              {(activeView === 'discover' || activeView === 'recommendations') && (
              <button type="button" onClick={() => setRecommendationRefresh((current) => current + 1)} disabled={isLoadingRecommendations}>
                {isLoadingRecommendations ? 'Refreshing ...' : 'Refresh recommendations'}
              </button>
            )}
            {activeView === 'library' && (
              <div className="library-actions">
                <span>{library.length} gespeichert</span>
                <button
                  type="button"
                  onClick={() => void downloadAll()}
                  disabled={!readyToDownload || downloadProgress !== null || isCheckingCompatibility}
                >
                  {downloadProgress ? `Downloading ${downloadProgress.current} / ${downloadProgress.total}` : `↓ Download all${downloadItems.length > 0 ? ` (${downloadItems.length})` : ''}`}
                </button>
                <button type="button" className="secondary-button" onClick={openInstallationGuide}>
                  ? How do I install these mods?
                </button>
                <button
                  type="button"
                  onClick={() => void checkCompatibility()}
                  disabled={isCheckingCompatibility || !selectedVersion || library.length === 0}
                >
                  {isCheckingCompatibility ? 'Prüfe ...' : 'Check Compatibility'}
                </button>
              </div>
            )}
          </div>

          {activeView === 'library' && (
            <div className="setup-summary compact" aria-live="polite">
              <div className="summary-item">
                <span className="summary-label">Minecraft</span>
                <strong>{selectedVersion}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Loader</span>
                <strong>{selectedLoader}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Mods</span>
                <strong>{library.length}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Required dependencies</span>
                <strong>{requiredDependencyCount}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Unavailable</span>
                <strong>{unavailableCount}</strong>
              </div>
              <div className={`summary-status ${readyToDownload ? 'ready' : 'action'}`}>
                {readyToDownload ? '✓ Ready to download' : '⚠ Action required'}
              </div>
            </div>
          )}

          {activeView === 'search' && error && <p className="message error-message">{error}</p>}
          {activeView === 'search' && isLoadingMods && <p className="message">Suche auf Modrinth ...</p>}
          {(activeView === 'discover' || activeView === 'recommendations') && recommendationError && <p className="message error-message">{recommendationError}</p>}
          {(activeView === 'discover' || activeView === 'recommendations') && isLoadingRecommendations && <p className="message">Finding recommendations ...</p>}
          {(activeView === 'discover' || activeView === 'recommendations') && !isLoadingRecommendations && !recommendationError && recommendationGroups.length === 0 && (
            <p className="message">Keine kompatiblen Empfehlungen für diese Version und diesen Loader gefunden.</p>
          )}
          {activeView === 'recommendations' && library.length === 0 && !isLoadingRecommendations && (
            <p className="message">Add some mods to My Library and we'll recommend mods that work well with your setup.</p>
          )}
          {activeView === 'library' && compatibilityError && <p className="message error-message">{compatibilityError}</p>}
          {activeView === 'library' && libraryFeedback && <p className="message success-message" role="status">{libraryFeedback}</p>}
          {activeView === 'library' && isCheckingCompatibility && (
            <p className="message">Kompatibilität wird mit Modrinth geprüft ...</p>
          )}
          {!isLoadingMods && !error && visibleMods.length === 0 && (
            <p className="message">
              {activeView === 'search'
                ? 'Keine Mods für diese Suche, Version und Loader gefunden.'
                : 'Deine Bibliothek ist noch leer.'}
            </p>
          )}

          {activeView === 'discover' || activeView === 'recommendations' ? (
            <div className="recommendation-groups">
              {recommendationGroups.map((group) => {
                const compatibleMods = group.mods.filter(
                  (mod) => {
                    const result = compatibility[mod.project_id]
                    return result?.status === 'compatible' && Boolean(result.version && getJarFile(result.version))
                  },
                )
                if (compatibleMods.length === 0) return null
                return (
                  <section className="recommendation-section" key={group.title}>
                    <div className="section-heading">
                      <h3>{group.title}</h3>
                      <span>{compatibleMods.length} compatible mods</span>
                    </div>
                    <div className="mod-grid">
                      {compatibleMods.map((mod) => {
                        const result = compatibility[mod.project_id]
                        const file = result?.version ? getJarFile(result.version) : undefined
                        const inLibrary = library.some((libraryMod) => libraryMod.project_id === mod.project_id)
                        return (
                          <article
                            className="mod-card"
                            key={mod.project_id}
                            tabIndex={0}
                            role="button"
                            onClick={() => viewMod(mod)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') viewMod(mod)
                            }}
                          >
                            {mod.icon_url ? <img className="mod-icon" src={mod.icon_url} alt="" /> : <div className="mod-icon icon-placeholder" aria-hidden="true" />}
                            <div className="mod-content">
                              <h2>{mod.title}</h2>
                              <p>{mod.description}</p>
                              <div className="mod-details">
                                <span>Author: {mod.author || 'Unknown'}</span>
                                <span>{selectedVersion} · {selectedLoader}</span>
                              </div>
                              <div className="compatibility-details">
                                <span>{group.personalized && library.length > 0
                                  ? getRecommendationReason(mod, library)
                                  : `Recommended for: ${group.title}`}</span>
                                <strong className="compatibility-status compatible">Compatible</strong>
                                {result?.version && <span>Version: {result.version.version_number}</span>}
                                {file ? <span>File: {file.filename} ({formatFileSize(file.size)})</span> : <span>No compatible .jar file available</span>}
                                {result && result.requiredDependencies.length > 0 && (
                                  <span>Required dependencies: {result.requiredDependencies.map((dependency) => dependency.title).join(', ')}</span>
                                )}
                              </div>
                              <div className="mod-actions">
                                <button
                                  type="button"
                                  disabled={inLibrary}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (!inLibrary) addRecommendationToLibrary(mod)
                                  }}
                                >
                                  {inLibrary ? '✓ In Library' : '+ Add to Library'}
                                </button>
                                <button
                                  type="button"
                                  disabled={!file || downloadStates[mod.project_id] === 'downloading'}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (file) void downloadFile({ projectId: mod.project_id, title: mod.title, file, isDependency: false })
                                  }}
                                >
                                  {downloadStates[mod.project_id] === 'success' ? 'Downloaded' : '↓ Download'}
                                </button>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
          <div className="mod-grid">
            {visibleMods.map((mod) => (
              <article
                className="mod-card"
                key={mod.project_id}
                tabIndex={0}
                role="button"
                onClick={() => viewMod(mod)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') viewMod(mod)
                }}
              >
                {(() => {
                  const result = compatibility[mod.project_id]
                  return (
                    <>
                      {mod.icon_url ? (
                        <img className="mod-icon" src={mod.icon_url} alt="" />
                      ) : (
                        <div className="mod-icon icon-placeholder" aria-hidden="true" />
                      )}
                      <div className="mod-content">
                        <h2>{mod.title}</h2>
                        <p>{mod.description}</p>
                        <div className="mod-details">
                          <span>Author: {mod.author || 'Unknown'}</span>
                          <span>{selectedVersion} · {selectedLoader}</span>
                        </div>
                        {result && (
                          <div className="compatibility-details">
                            <strong className={`compatibility-status ${result.status}`}>
                              {result.status === 'compatible' &&
                                (getMissingDependencies(result).length > 0 ? '⚠ Missing required dependencies' : '🟢 Compatible')}
                              {result.status === 'not-compatible' && '🔴 Not compatible'}
                              {result.status === 'error' && '⚠️ Prüfung fehlgeschlagen'}
                            </strong>
                            {result.version && (
                              <>
                                <span>Version: {result.version.version_number}</span>
                                <span>{selectedLoader} · Minecraft {selectedVersion}</span>
                                {getJarFile(result.version) ? (
                                  <span>
                                    File: {getJarFile(result.version)?.filename} (
                                    {formatFileSize(getJarFile(result.version)?.size ?? 0)})
                                  </span>
                                ) : (
                                  <span>Keine .jar-Datei verfügbar</span>
                                )}
                              </>
                            )}
                            {result.requiredDependencies.length > 0 && (
                              <div className="dependency-list required">
                                <span className="dependency-title">Required dependencies:</span>
                                {result.requiredDependencies.map((dependency) => (
                                  <span key={dependency.projectId} className="dependency-pill">
                                    {dependency.title}
                                    <button
                                      type="button"
                                      disabled={!dependency.version}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        void addDependenciesToLibrary([dependency])
                                      }}
                                    >
                                      {!dependency.version
                                        ? 'Unavailable'
                                        : isProjectInLibrary(dependency.projectId)
                                          ? '✓ Added'
                                          : '+ Add'}
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                            {getMissingDependencies(result).length > 0 && (
                              <div className="dependency-list missing">
                                <span className="dependency-title">Required dependency:</span>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    void addDependenciesToLibrary(result.requiredDependencies)
                                  }}
                                >
                                  + Add required dependencies
                                </button>
                                {getMissingDependencies(result).map((dependency) => (
                                  <div key={dependency.projectId} className="dependency-card">
                                    <strong>{dependency.title}</strong>
                                    <span>{dependency.reason}</span>
                                    <span>Required by {dependency.requiredBy}</span>
                                    {dependency.version ? (
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          void addDependenciesToLibrary([dependency])
                                        }}
                                      >
                                        {isProjectInLibrary(dependency.projectId)
                                          ? '✓ Added'
                                          : '+ Add'}
                                      </button>
                                    ) : (
                                      <span className="error-message">Unavailable for selected version or loader.</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {result.status === 'compatible' && result.version && (
                              <div className="mod-actions">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (!library.some((libraryMod) => libraryMod.project_id === mod.project_id)) {
                                      addToLibrary(mod)
                                    }
                                  }}
                                  disabled={library.some((libraryMod) => libraryMod.project_id === mod.project_id)}
                                >
                                  {library.some((libraryMod) => libraryMod.project_id === mod.project_id)
                                    ? '✓ In Library'
                                    : '+ Add to Library'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    const file = getJarFile(result.version!)
                                    if (file) {
                                      void downloadFile({
                                        projectId: mod.project_id,
                                        title: mod.title,
                                        file,
                                        isDependency: false,
                                      })
                                    }
                                  }}
                                  disabled={!getJarFile(result.version) || downloadStates[mod.project_id] === 'downloading'}
                                >
                                  {!getJarFile(result.version)
                                    ? '↓ Download unavailable'
                                    : downloadStates[mod.project_id] === 'success'
                                      ? 'Downloaded'
                                      : '↓ Download'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {!result && (
                          <div className="mod-actions">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                void downloadMod(mod)
                              }}
                              disabled={downloadStates[mod.project_id] === 'downloading'}
                            >
                              {downloadStates[mod.project_id] === 'downloading' ? 'Downloading ...' : '↓ Download'}
                            </button>
                          </div>
                        )}
                        <div className="mod-meta">
                          <span>{selectedVersion}</span>
                          <span>{selectedLoader}</span>
                          {mod.categories
                            .filter((category) =>
                              Object.values(LOADER_CATEGORIES).includes(
                                category as (typeof LOADER_CATEGORIES)[keyof typeof LOADER_CATEGORIES],
                              ),
                            )
                            .map((category) => (
                              <span key={category}>{category}</span>
                            ))}
                        </div>
                      </div>
                      {activeView === 'library' && (
                        <button
                          className="remove-button"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            removeFromLibrary(mod.project_id)
                          }}
                        >
                          Entfernen
                        </button>
                      )}
                    </>
                  )
                })()}
              </article>
            ))}
          </div>
          )}

          {activeView === 'library' && libraryDependencies.length > 0 && (
            <section className="dependency-section" aria-labelledby="library-dependencies-title">
              <div className="section-heading">
                <h2 id="library-dependencies-title">Required dependencies</h2>
                <span>{missingLibraryDependencies.length} missing</span>
              </div>
              <div className="dependency-grid">
                {libraryDependencies.filter((dependency) => !isProjectInLibrary(dependency.projectId) || !dependency.version || !dependency.file).map((dependency) => (
                  <div className="dependency-card" key={dependency.projectId}>
                    <strong>{dependency.title}</strong>
                    <span>{dependency.reason}</span>
                    <span className={dependency.file ? 'success-text' : 'error-message'}>
                      {dependency.file ? `${selectedVersion} · ${selectedLoader} · ${dependency.file.filename}` : dependency.error}
                    </span>
                  </div>
                ))}
              </div>
              {unavailableDependencies.length > 0 && (
                <p className="message error-message">
                  {unavailableDependencies.length} required dependencies are unavailable or incompatible.
                </p>
              )}
            </section>
          )}
        </section>
      )}

      {selectedMod && (
        <div className="modal-backdrop" onClick={() => setSelectedMod(null)}>
          <div
            className="mod-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mod-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              aria-label="Details schließen"
              onClick={() => setSelectedMod(null)}
            >
              ×
            </button>
            {selectedMod.icon_url && (
              <img className="modal-icon" src={selectedMod.icon_url} alt="" />
            )}
            <h2 id="mod-modal-title">{selectedMod.title}</h2>
            <p>{selectedMod.description}</p>
            <div className="mod-details">
              <span>Author: {selectedMod.author || 'Unknown'}</span>
              <span>{selectedVersion} · {selectedLoader}</span>
            </div>
            <div className="mod-meta">
              {selectedMod.categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
            {(() => {
              const result = compatibility[selectedMod.project_id]
              const file = result?.version ? getJarFile(result.version) : undefined
              return (
                <div className="modal-compatibility">
                  <strong className={`compatibility-status ${result?.status ?? 'not-compatible'}`}>
                    {result?.status === 'compatible' && getMissingDependencies(result).length === 0 && 'Compatible'}
                    {result?.status === 'compatible' && getMissingDependencies(result).length > 0 && 'Missing required dependencies'}
                    {result?.status === 'not-compatible' && 'Not compatible'}
                    {result?.status === 'error' && 'Compatibility check failed'}
                    {!result && 'Compatibility not checked yet'}
                  </strong>
                  <span>Selected compatibility: Minecraft {selectedVersion} · {selectedLoader}</span>
                  {file ? <span>Available file: {file.filename} ({formatFileSize(file.size)})</span> : <span>No compatible .jar file available</span>}
                  {result && result.requiredDependencies.length > 0 && (
                    <span>Dependencies: {result.requiredDependencies.map((dependency) => dependency.title).join(', ')}</span>
                  )}
                </div>
              )
            })()}
            <button
              type="button"
              disabled={isSelectedModInLibrary}
              onClick={() => addToLibrary(selectedMod)}
            >
              {isSelectedModInLibrary ? 'In My Library' : 'Add to Library'}
            </button>
            {libraryFeedback && isSelectedModInLibrary && <p className="message success-message" role="status">{libraryFeedback}</p>}
          </div>
        </div>
      )}

      {showInstallationGuide && (
        <div className="modal-backdrop" onClick={() => setShowInstallationGuide(false)}>
          <div
            className="mod-modal installation-guide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="installation-guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              aria-label="Installation guide schließen"
              onClick={() => setShowInstallationGuide(false)}
            >
              ×
            </button>
            <p className="eyebrow">ModSync browser guide</p>
            <h2 id="installation-guide-title">How to install your downloaded mods</h2>
            <p>Selected setup: Minecraft {selectedVersion} with {selectedLoader}.</p>
            <ol>
              <li>Make sure Minecraft is installed.</li>
              <li>Install {selectedLoader} for Minecraft {selectedVersion}.</li>
              <li>Click <strong>Download all</strong>. Your browser downloads the .jar files. If multiple downloads are blocked, allow downloads for ModSync.</li>
              <li>Open the Minecraft <strong>mods</strong> folder. On Windows, press <strong>Windows + R</strong>, enter <strong>%appdata%\.minecraft\mods</strong>, and press Enter.</li>
              <li>If the <strong>mods</strong> folder does not exist, create it inside <strong>.minecraft</strong>.</li>
              <li>Move every downloaded <strong>.jar</strong> file into <strong>.minecraft/mods</strong>.</li>
              <li>Start Minecraft using the {selectedLoader} profile for Minecraft {selectedVersion}.</li>
            </ol>
            <p className="message">Keep required dependencies in the same mods folder. ModSync does not modify Minecraft files while running in your browser.</p>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>ModSync is currently in beta. Found a bug or have an idea? <button type="button" className="text-button" onClick={() => openFeedback('General feedback')}>Send us feedback</button></p>
        <nav aria-label="Help links">
          <button type="button" className="text-button" onClick={() => openFeedback('General feedback')}>Feedback</button>
          <button type="button" className="text-button" onClick={() => setActiveView('support')}>Support</button>
          <a href="https://github.com/KingJan13/modsync" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </footer>
    </main>
  )
}

export default App

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

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
  title: string
  description: string
  icon_url?: string
  categories: string[]
  versions: string[]
}

type ModrinthSearchResponse = {
  hits: ModrinthSearchHit[]
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

type CompatibilityResult = {
  status: 'compatible' | 'not-compatible' | 'update-available' | 'error'
  version?: ModrinthVersion
  missingDependencies: ModrinthSearchHit[]
  error?: string
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
    return Array.isArray(parsed) ? (parsed as ModrinthSearchHit[]) : []
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
  const [activeView, setActiveView] = useState<'discover' | 'library'>('discover')
  const [selectedMod, setSelectedMod] = useState<ModrinthSearchHit | null>(null)
  const [compatibility, setCompatibility] = useState<Record<string, CompatibilityResult>>({})
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false)
  const [compatibilityError, setCompatibilityError] = useState('')
  const [minecraftInstallation, setMinecraftInstallation] = useState<MinecraftInstallation | null>(null)
  const [isDetectingMinecraft, setIsDetectingMinecraft] = useState(false)
  const [minecraftDetectionError, setMinecraftDetectionError] = useState('')
  const isDesktopApp = Boolean(window.__TAURI_INTERNALS__)

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
    if (!selectedVersion || !submittedQuery.trim()) {
      return
    }

    const controller = new AbortController()
    const facets = JSON.stringify([
      ['project_type:mod'],
      [`versions:${selectedVersion}`],
      [`categories:${LOADER_CATEGORIES[selectedLoader]}`],
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
  }, [selectedLoader, selectedVersion, submittedQuery])

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
  }

  function addToLibrary(mod: ModrinthSearchHit) {
    setLibrary((current) =>
      current.some((libraryMod) => libraryMod.project_id === mod.project_id)
        ? current
        : [...current, mod],
    )
  }

  function removeFromLibrary(projectId: string) {
    setLibrary((current) =>
      current.filter((libraryMod) => libraryMod.project_id !== projectId),
    )
  }

  async function fetchProject(projectId: string): Promise<ModrinthSearchHit> {
    const response = await fetch(`${MODRINTH_API}/project/${projectId}`)
    if (!response.ok) throw new Error('Projekt konnte nicht geladen werden.')
    return response.json() as Promise<ModrinthSearchHit>
  }

  async function checkCompatibility() {
    if (!selectedVersion || library.length === 0) return

    setIsCheckingCompatibility(true)
    setCompatibilityError('')
    setCompatibility({})
    try {
      const loader = LOADER_CATEGORIES[selectedLoader]
      const results = await Promise.all(
        library.map(async (mod): Promise<[string, CompatibilityResult]> => {
          try {
            const response = await fetch(`${MODRINTH_API}/project/${mod.project_id}/version`)
            if (!response.ok) throw new Error('Versionen konnten nicht geladen werden.')
            const versions = (await response.json()) as ModrinthVersion[]
            const compatibleVersion = versions.find(
              (version) =>
                version.game_versions.includes(selectedVersion) && version.loaders.includes(loader),
            )
            if (!compatibleVersion) {
              return [mod.project_id, { status: 'not-compatible', missingDependencies: [] }]
            }

            const requiredDependencies = compatibleVersion.dependencies.filter(
              (dependency) => dependency.dependency_type === 'required',
            )
            const dependencyProjects = await Promise.all(
              requiredDependencies.map(async (dependency) => {
                if (dependency.project_id) return dependency.project_id
                if (!dependency.version_id) return null
                const dependencyResponse = await fetch(`${MODRINTH_API}/version/${dependency.version_id}`)
                if (!dependencyResponse.ok) return null
                const dependencyVersion = (await dependencyResponse.json()) as { project_id?: string }
                return dependencyVersion.project_id ?? null
              }),
            )
            const requiredProjectIds = dependencyProjects.filter(
              (projectId): projectId is string => Boolean(projectId),
            )
            const missingProjectIds = requiredProjectIds.filter(
              (projectId) => !library.some((libraryMod) => libraryMod.project_id === projectId),
            )
            const missingDependencies = await Promise.all(
              [...new Set(missingProjectIds)].map((projectId) => fetchProject(projectId)),
            )

            return [mod.project_id, { status: 'compatible', version: compatibleVersion, missingDependencies }]
          } catch {
            return [mod.project_id, { status: 'error', missingDependencies: [], error: 'API-Fehler' }]
          }
        }),
      )
      setCompatibility(Object.fromEntries(results))
    } catch {
      setCompatibilityError('Kompatibilitätsprüfung fehlgeschlagen. Bitte später erneut versuchen.')
    } finally {
      setIsCheckingCompatibility(false)
    }
  }

  function formatFileSize(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
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

  const isSelectedModInLibrary = selectedMod
    ? library.some((mod) => mod.project_id === selectedMod.project_id)
    : false
  const visibleMods = activeView === 'discover' ? mods : library
  const versionGroups = versions.reduce<Record<string, MinecraftVersion[]>>(
    (groups, version) => {
      const groupName = version.id.split('.').slice(0, 2).join('.')
      groups[groupName] = [...(groups[groupName] ?? []), version]
      return groups
    },
    {},
  )

  return (
    <main className="app-shell">
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
          className={activeView === 'library' ? 'nav-button active' : 'nav-button'}
          type="button"
          onClick={() => setActiveView('library')}
        >
          My Library <span className="library-count">{library.length}</span>
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

      {activeView === 'discover' && <section className="controls" aria-label="Suchfilter">
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
            onChange={(event) => setSelectedVersion(event.target.value)}
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
            onChange={(event) =>
              setSelectedLoader(event.target.value as (typeof LOADERS)[number])
            }
          >
            {LOADERS.map((loader) => (
              <option key={loader} value={loader}>
                {loader}
              </option>
            ))}
          </select>
        </div>
      </section>}

      <section className="results" aria-live="polite">
        <div className="section-heading">
          <h2>{activeView === 'discover' ? 'Entdecken' : 'My Library'}</h2>
          {activeView === 'library' && (
            <div className="library-actions">
              <span>{library.length} gespeichert</span>
              <button type="button" onClick={checkCompatibility} disabled={isCheckingCompatibility || !selectedVersion || library.length === 0}>
                {isCheckingCompatibility ? 'Prüfe ...' : 'Check Compatibility'}
              </button>
            </div>
          )}
        </div>
        {activeView === 'discover' && error && <p className="message error-message">{error}</p>}
        {activeView === 'discover' && isLoadingMods && <p className="message">Suche auf Modrinth ...</p>}
        {activeView === 'library' && compatibilityError && <p className="message error-message">{compatibilityError}</p>}
        {activeView === 'library' && isCheckingCompatibility && <p className="message">Kompatibilität wird mit Modrinth geprüft ...</p>}
        {!isLoadingMods && !error && visibleMods.length === 0 && (
          <p className="message">
            {activeView === 'discover'
              ? 'Keine Mods für diese Suche, Version und Loader gefunden.'
              : 'Deine Bibliothek ist noch leer.'}
          </p>
        )}
        <div className="mod-grid">
          {visibleMods.map((mod) => (
            <article
              className="mod-card"
              key={mod.project_id}
              tabIndex={0}
              role="button"
              onClick={() => setSelectedMod(mod)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setSelectedMod(mod)
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
                {activeView === 'library' && result && (
                  <div className="compatibility-details">
                    <strong className={`compatibility-status ${result.status}`}>
                      {result.status === 'compatible' && '🟢 Compatible'}
                      {result.status === 'not-compatible' && '🔴 Not compatible'}
                      {result.status === 'error' && '⚠️ Prüfung fehlgeschlagen'}
                    </strong>
                    {result.version && (
                      <>
                        <span>Version: {result.version.version_number}</span>
                        <span>{selectedLoader} · Minecraft {selectedVersion}</span>
                        {result.version.files[0] && (
                          <a href={result.version.files[0].url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                            Download: {result.version.files[0].filename} ({formatFileSize(result.version.files[0].size)})
                          </a>
                        )}
                      </>
                    )}
                    {result.missingDependencies.length > 0 && (
                      <div className="dependency-list">
                        <span>Missing dependency:</span>
                        {result.missingDependencies.map((dependency) => (
                          <button key={dependency.project_id} type="button" onClick={(event) => { event.stopPropagation(); addToLibrary(dependency) }}>
                            Add {dependency.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="mod-meta">
                  <span>{selectedVersion}</span>
                  {mod.categories
                    .filter((category) => Object.values(LOADER_CATEGORIES).includes(category as (typeof LOADER_CATEGORIES)[keyof typeof LOADER_CATEGORIES]))
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
      </section>

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
            <button
              type="button"
              disabled={isSelectedModInLibrary}
              onClick={() => addToLibrary(selectedMod)}
            >
              {isSelectedModInLibrary ? 'In My Library' : 'Add to My Library'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App

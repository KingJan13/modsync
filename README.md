# ModSync

ModSync is a React and TypeScript application powered by Vite.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app is available at the local URL printed by Vite.

## Checks

```bash
npm run lint
npm run build
```

## Analytics

ModSync supports optional privacy-conscious analytics through Umami Cloud. It measures page views and product actions such as searches, library changes, compatibility checks, recommendations, support, feedback exports, and downloads. It does not collect emails, usernames, IP addresses, search text, messages, URLs with personal data, or mod/file contents.

Analytics is disabled unless both `VITE_UMAMI_WEBSITE_ID` and `VITE_UMAMI_SCRIPT_URL` are configured. In Umami Cloud, create or open the ModSync website under **Settings -> Websites**, copy its Website ID, then copy `.env.example` to `.env` and set the ID. Use `https://cloud.umami.is/script.js` for Umami Cloud. Analytics loads only after the user accepts the in-app opt-in notice; declining it disables tracking. Removing the variables disables it entirely.

After deployment, view visitors, page views, and custom events in the Umami Cloud dashboard by opening the ModSync website and selecting **Analytics**. No production analytics is active in this repository until a real Umami Website ID is supplied. Local development with empty variables generates no analytics traffic.

## Setup manifests and desktop installation

The web app can export a `modsync-setup` JSON manifest after compatibility
resolution. It contains the selected Minecraft version and loader, Modrinth
project/version IDs, JAR filenames, HTTPS download URLs, dependencies, and the
creation timestamp. In the Tauri build, **Open setup** imports that manifest.
The user must validate a Minecraft directory and explicitly press **Install**.
The installer creates only the `mods` directory, writes the resolved JARs, and
stores `.modsync/installed-setup.json` for future update checks. It never
deletes unrelated files. Browser mode can export/download files but cannot
write into `.minecraft`.

## Windows desktop build

The Tauri desktop app detects the standard Windows Java Edition directory at
`%APPDATA%\\.minecraft` and the CurseForge installation directory. It validates
the selected directory before installation and writes only resolved JAR files
to its `mods` directory after the user explicitly presses **Install**. It does
not delete unrelated mods. The `mods` and `versions` directories are reported
when they exist.

Install Rust and the Windows prerequisites described in the Tauri 2 Windows
guide, then build the installer or executable with:

```bash
npm run tauri:build
```

The Windows build must be run on Windows (or with a configured Windows
cross-compilation toolchain). Artifacts are written below
`src-tauri/target/release/bundle/`.

Pushing a `v*` tag or starting the `Windows release` GitHub Actions workflow
builds the Tauri installer on `windows-latest`, creates a draft prerelease, and
uploads the `.exe`/`.msi` files as workflow artifacts. A public installer URL
is intentionally not configured until a real release is published; the web
app keeps its Windows download control disabled.

## Updates

ModSync does not currently claim automatic mod updates or application updates.
The installed setup manifest provides the durable input needed to compare
known project IDs against future compatible Modrinth versions. Tauri updater
signing, a public updater endpoint, and user-confirmed update UI still need to
be connected before either update flow can be enabled.

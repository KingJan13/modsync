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

## Windows desktop build

The Tauri desktop app detects the standard Windows Java Edition directory at
`%APPDATA%\\.minecraft` and the CurseForge installation directory. Detection
only reads directory state; it does not install, modify, or delete mods or
Minecraft files. The `mods` and `versions` directories are reported when they
exist.

Install Rust and the Windows prerequisites described in the Tauri 2 Windows
guide, then build the installer or executable with:

```bash
npm run tauri:build
```

The Windows build must be run on Windows (or with a configured Windows
cross-compilation toolchain). Artifacts are written below
`src-tauri/target/release/bundle/`.

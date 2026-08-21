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

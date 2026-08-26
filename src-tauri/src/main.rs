use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
struct MinecraftInstallation {
    found: bool,
    minecraft_directory: Option<String>,
    mods_directory: Option<String>,
    versions_directory: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetupManifest {
    format: String,
    format_version: u32,
    minecraft: MinecraftSetup,
    mods: Vec<SetupMod>,
}

#[derive(Debug, Deserialize)]
struct MinecraftSetup {
    version: String,
    loader: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetupMod {
    project_id: String,
    title: String,
    version_id: Option<String>,
    file_name: Option<String>,
    download_url: Option<String>,
    is_dependency: bool,
    dependencies: Vec<String>,
}

#[derive(Debug, Serialize)]
struct InstallationValidation {
    valid: bool,
    minecraft_directory: String,
    mods_directory: String,
    reason: Option<String>,
}

#[derive(Debug, Serialize)]
struct InstallFailure {
    file_name: String,
    reason: String,
}

#[derive(Debug, Serialize)]
struct InstallResult {
    installed: Vec<String>,
    failed: Vec<InstallFailure>,
}

fn existing_path(path: PathBuf) -> Option<String> {
    path.is_dir().then(|| path.to_string_lossy().into_owned())
}

fn validate_directory(path: &str) -> InstallationValidation {
    let directory = PathBuf::from(path);
    let mods_directory = directory.join("mods");
    let has_minecraft_structure = directory.join("versions").is_dir()
        || directory.join("launcher_profiles.json").is_file()
        || mods_directory.is_dir();
    InstallationValidation {
        valid: directory.is_dir() && has_minecraft_structure,
        minecraft_directory: directory.to_string_lossy().into_owned(),
        mods_directory: mods_directory.to_string_lossy().into_owned(),
        reason: if !directory.is_dir() {
            Some("The selected path is not a directory.".to_string())
        } else if !has_minecraft_structure {
            Some("This directory does not look like a Minecraft Java installation.".to_string())
        } else {
            None
        },
    }
}

fn safe_file_name(file_name: &str) -> bool {
    !file_name.is_empty()
        && file_name != "."
        && file_name != ".."
        && !file_name.contains('/')
        && !file_name.contains('\\')
}

fn push_unique(candidates: &mut Vec<PathBuf>, candidate: PathBuf) {
    if !candidates.iter().any(|existing| existing == &candidate) {
        candidates.push(candidate);
    }
}

#[tauri::command]
fn detect_minecraft() -> MinecraftInstallation {
    let mut candidates = Vec::new();

    if let Ok(app_data) = env::var("APPDATA") {
        let app_data = PathBuf::from(app_data);
        push_unique(&mut candidates, app_data.join(".minecraft"));
        push_unique(
            &mut candidates,
            app_data.join("CurseForge").join("Minecraft").join("Install"),
        );
    }
    if let Ok(user_profile) = env::var("USERPROFILE") {
        push_unique(
            &mut candidates,
            PathBuf::from(user_profile)
                .join("AppData")
                .join("Roaming")
                .join(".minecraft"),
        );
    }
    if let Ok(home) = env::var("HOME") {
        push_unique(&mut candidates, PathBuf::from(home).join(".minecraft"));
    }

    let minecraft_directory = candidates
        .into_iter()
        .find(|candidate| candidate.is_dir());
    let mods_directory = minecraft_directory
        .as_ref()
        .map(|directory| directory.join("mods"))
        .and_then(existing_path);
    let versions_directory = minecraft_directory
        .as_ref()
        .map(|directory| directory.join("versions"))
        .and_then(existing_path);
    let minecraft_directory = minecraft_directory.and_then(existing_path);

    MinecraftInstallation {
        found: minecraft_directory.is_some(),
        minecraft_directory,
        mods_directory,
        versions_directory,
    }
}

#[tauri::command]
fn validate_minecraft_directory(path: String) -> InstallationValidation {
    validate_directory(&path)
}

#[tauri::command]
fn install_setup(manifest: SetupManifest, install_dir: String) -> Result<InstallResult, String> {
    if manifest.format != "modsync-setup" || manifest.format_version != 1 {
        return Err("Unsupported ModSync setup manifest.".to_string());
    }
    let validation = validate_directory(&install_dir);
    if !validation.valid {
        return Err(validation.reason.unwrap_or_else(|| "Invalid Minecraft installation.".to_string()));
    }
    let mods_directory = PathBuf::from(&validation.mods_directory);
    fs::create_dir_all(&mods_directory).map_err(|error| format!("Could not create mods folder: {error}"))?;
    let client = Client::builder()
        .user_agent("ModSync Desktop/0.1")
        .build()
        .map_err(|error| format!("Could not start download client: {error}"))?;
    let mut installed = Vec::new();
    let mut failed = Vec::new();

    for item in &manifest.mods {
        let file_name = item.file_name.clone().unwrap_or_default();
        let url = item.download_url.clone().unwrap_or_default();
        if !safe_file_name(&file_name) || !url.starts_with("https://") {
            failed.push(InstallFailure { file_name, reason: format!("{} has no safe downloadable JAR.", item.title) });
            continue;
        }
        let response = match client.get(url).send() {
            Ok(response) if response.status().is_success() => response,
            Ok(response) => {
                failed.push(InstallFailure { file_name, reason: format!("Download returned {}.", response.status()) });
                continue;
            }
            Err(error) => {
                failed.push(InstallFailure { file_name, reason: format!("Download failed: {error}") });
                continue;
            }
        };
        let bytes = match response.bytes() {
            Ok(bytes) => bytes,
            Err(error) => {
                failed.push(InstallFailure { file_name, reason: format!("Could not read download: {error}") });
                continue;
            }
        };
        let destination = mods_directory.join(&file_name);
        if let Err(error) = fs::write(&destination, &bytes) {
            failed.push(InstallFailure { file_name, reason: format!("Could not write file: {error}") });
            continue;
        }
        installed.push(file_name);
    }

    Ok(InstallResult { installed, failed })
}

#[tauri::command]
fn read_installed_setup(install_dir: String) -> Result<Option<SetupManifest>, String> {
    let path = PathBuf::from(install_dir).join(".modsync").join("installed-setup.json");
    if !path.is_file() {
        return Ok(None);
    }
    let content = fs::read_to_string(path).map_err(|error| format!("Could not read installed setup: {error}"))?;
    serde_json::from_str(&content).map(Some).map_err(|error| format!("Installed setup metadata is invalid: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![detect_minecraft, validate_minecraft_directory, install_setup, read_installed_setup])
        .run(tauri::generate_context!())
        .expect("error while running ModSync");
}

fn main() {
    run();
}
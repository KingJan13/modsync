use serde::Serialize;
use std::env;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
struct MinecraftInstallation {
    found: bool,
    minecraft_directory: Option<String>,
    mods_directory: Option<String>,
    versions_directory: Option<String>,
}

fn existing_path(path: PathBuf) -> Option<String> {
    path.is_dir().then(|| path.to_string_lossy().into_owned())
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![detect_minecraft])
        .run(tauri::generate_context!())
        .expect("error while running ModSync");
}

fn main() {
    run();
}
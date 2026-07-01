use std::cmp::Ordering;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use notify::{EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use tauri::{Emitter, State};

/// Holds the active filesystem watcher so it stays alive between calls.
struct WatchState {
    watcher: Mutex<Option<RecommendedWatcher>>,
}

/// A node in the Markdown file tree returned to the frontend.
#[derive(Serialize)]
pub struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    children: Option<Vec<FileNode>>,
}

const MD_EXTENSIONS: [&str; 4] = ["md", "markdown", "mdown", "mkd"];

fn is_markdown(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| MD_EXTENSIONS.contains(&e.to_lowercase().as_str()))
        .unwrap_or(false)
}

/// Recursively build a tree of directories and Markdown files.
/// Directories that contain no Markdown (transitively) are pruned.
fn build_tree(dir: &Path, depth: usize) -> Vec<FileNode> {
    let mut nodes: Vec<FileNode> = Vec::new();

    // Guard against pathological trees (and any missed symlink cycle).
    if depth > 40 {
        return nodes;
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return nodes,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files/folders and common noise.
        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        // Skip symlinks entirely to avoid following cycles out of the folder.
        if path.is_symlink() {
            continue;
        }

        if path.is_dir() {
            let children = build_tree(&path, depth + 1);
            if !children.is_empty() {
                nodes.push(FileNode {
                    name,
                    path: path.to_string_lossy().to_string(),
                    is_dir: true,
                    children: Some(children),
                });
            }
        } else if is_markdown(&path) {
            nodes.push(FileNode {
                name,
                path: path.to_string_lossy().to_string(),
                is_dir: false,
                children: None,
            });
        }
    }

    // Sort: directories first, then files; each alphabetically (case-insensitive).
    nodes.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => Ordering::Less,
        (false, true) => Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    nodes
}

/// Read a folder and return its Markdown file tree.
#[tauri::command]
fn read_tree(path: String) -> Result<Vec<FileNode>, String> {
    let root = PathBuf::from(&path);
    if !root.is_dir() {
        return Err(format!("Not a directory: {path}"));
    }
    Ok(build_tree(&root, 0))
}

/// Read the UTF-8 contents of a single Markdown file.
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    if !is_markdown(&p) {
        return Err("Only Markdown files can be opened.".into());
    }
    fs::read_to_string(&p).map_err(|e| format!("Could not read file: {e}"))
}

/// Return the base name of a path (for window titles / headers).
#[tauri::command]
fn base_name(path: String) -> String {
    Path::new(&path)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or(path)
}

/// Watch a folder recursively; emit `fs-change` (a list of affected paths) to
/// the frontend whenever files are created, modified, or removed. Calling this
/// again replaces the previous watcher.
#[tauri::command]
fn watch_path(
    app: tauri::AppHandle,
    state: State<'_, WatchState>,
    path: String,
) -> Result<(), String> {
    let root = PathBuf::from(&path);
    if !root.is_dir() {
        return Err(format!("Not a directory: {path}"));
    }

    let app_handle = app.clone();
    let mut watcher = notify::recommended_watcher(move |res: notify::Result<notify::Event>| {
        if let Ok(event) = res {
            if matches!(
                event.kind,
                EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_)
            ) {
                let paths: Vec<String> = event
                    .paths
                    .iter()
                    .map(|p| p.to_string_lossy().to_string())
                    .collect();
                let _ = app_handle.emit("fs-change", paths);
            }
        }
    })
    .map_err(|e| e.to_string())?;

    watcher
        .watch(&root, RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    // Replacing the stored watcher drops (and stops) any previous one.
    *state.watcher.lock().map_err(|e| e.to_string())? = Some(watcher);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(WatchState {
            watcher: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            read_tree,
            read_file,
            base_name,
            watch_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running ZIMD");
}

use serde::Serialize;
use tauri::Manager;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopCapabilities {
  app_data_dir: String,
  download_root: String,
  database_path: String,
}

#[tauri::command]
fn desktop_capabilities(app: tauri::AppHandle) -> Result<DesktopCapabilities, String> {
  let app_data_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
  let download_root = app_data_dir.join("downloads");
  let database_path = app_data_dir.join("mihon-clone.sqlite3");

  Ok(DesktopCapabilities {
    app_data_dir: app_data_dir.to_string_lossy().to_string(),
    download_root: download_root.to_string_lossy().to_string(),
    database_path: database_path.to_string_lossy().to_string(),
  })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![desktop_capabilities])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

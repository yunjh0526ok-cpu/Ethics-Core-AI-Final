/**
 * 바탕 화면에 PPT 관련 exe 복사 (빌드된 경우).
 * - CLI: npm run build:ppt-exe → Ethics-Core-PPT.exe
 * - GUI: npm run build:ppt-gui → Ethics-Core-PPT-GUI.exe
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

function findDesktopDir() {
  const home = os.homedir();
  const candidates = [
    path.join(home, "Desktop"),
    path.join(home, "OneDrive", "Desktop"),
    path.join(home, "OneDrive", "바탕 화면"),
    path.join(home, "바탕 화면"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
    } catch {
      /* ignore */
    }
  }
  return path.join(home, "Desktop");
}

const desktop = findDesktopDir();
const oldBat = path.join(desktop, "Ethics-Core-PPT자동생성.bat");

if (!fs.existsSync(desktop)) {
  console.warn("[sync-desktop-launcher] 바탕 화면 폴더가 없어 건너뜁니다:", desktop);
  process.exit(0);
}

try {
  if (fs.existsSync(oldBat)) fs.unlinkSync(oldBat);
} catch {
  /* ignore */
}

function copyIf(src, dst) {
  if (!fs.existsSync(src)) return false;
  try {
    fs.copyFileSync(src, dst);
    console.log("[sync-desktop-launcher] 복사됨:", dst);
    return true;
  } catch (e) {
    console.warn("[sync-desktop-launcher] 복사 실패:", e instanceof Error ? e.message : e);
    return false;
  }
}

const cliSrc = path.join(REPO_ROOT, "dist-ppt", "EthicsCore-PPT.exe");
const guiSrc = path.join(REPO_ROOT, "dist-ppt-gui", "EthicsCore-PPT-GUI.exe");

const cliOk = copyIf(cliSrc, path.join(desktop, "Ethics-Core-PPT.exe"));
const guiOk = copyIf(guiSrc, path.join(desktop, "Ethics-Core-PPT-GUI.exe"));

if (!cliOk) {
  console.warn(
    "[sync-desktop-launcher] CLI exe 없음 → npm run build:ppt-exe (선택)"
  );
}
if (!guiOk) {
  console.warn(
    "[sync-desktop-launcher] GUI exe 없음 → npm run build:ppt-gui (Python + PyInstaller)"
  );
}

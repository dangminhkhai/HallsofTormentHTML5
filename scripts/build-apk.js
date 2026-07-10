/**
 * Build debug APK via Gradle if Android SDK is available.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const androidDir = path.join(root, "android");
const isWin = process.platform === "win32";
const gradlew = path.join(androidDir, isWin ? "gradlew.bat" : "gradlew");

function findJavaHome() {
  if (process.env.JAVA_HOME && fs.existsSync(process.env.JAVA_HOME)) return process.env.JAVA_HOME;
  const candidates = [
    "C:\\Program Files\\Microsoft\\jdk-17*",
    "C:\\Program Files\\Eclipse Adoptium\\jdk-17*",
    "C:\\Program Files\\Java\\jdk-17*",
    "C:\\Program Files\\Android\\Android Studio\\jbr",
  ];
  const { execSync } = require("child_process");
  try {
    if (isWin) {
      const out = execSync(
        'powershell -NoProfile -Command "Get-ChildItem \'C:\\Program Files\\Microsoft\',\'C:\\Program Files\\Eclipse Adoptium\',\'C:\\Program Files\\Java\' -ErrorAction SilentlyContinue | Where-Object { $_.Name -match \'jdk-?17|jdk17\' } | Select-Object -ExpandProperty FullName"',
        { encoding: "utf8" }
      );
      const line = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
      if (line && fs.existsSync(line)) return line;
    }
  } catch (_) { /* ignore */ }
  for (const pattern of candidates) {
    // skip glob without expand
  }
  return null;
}

function findSdk() {
  if (process.env.ANDROID_HOME && fs.existsSync(process.env.ANDROID_HOME)) return process.env.ANDROID_HOME;
  if (process.env.ANDROID_SDK_ROOT && fs.existsSync(process.env.ANDROID_SDK_ROOT)) return process.env.ANDROID_SDK_ROOT;
  const local = path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk");
  if (fs.existsSync(local)) return local;
  const home = path.join(process.env.USERPROFILE || "", "AppData", "Local", "Android", "Sdk");
  if (fs.existsSync(home)) return home;
  return null;
}

if (!fs.existsSync(androidDir) || !fs.existsSync(gradlew)) {
  console.error("android/ project missing. Run: npx cap add android");
  process.exit(1);
}

const javaHome = findJavaHome();
const sdk = findSdk();
console.log("JAVA_HOME:", javaHome || "(not found)");
console.log("ANDROID_SDK:", sdk || "(not found)");

if (!sdk) {
  console.error("\nChưa có Android SDK. Cài Android Studio hoặc chạy scripts/setup-android-sdk.ps1");
  process.exit(2);
}

const env = { ...process.env };
if (javaHome) env.JAVA_HOME = javaHome;
env.ANDROID_HOME = sdk;
env.ANDROID_SDK_ROOT = sdk;
// Prefer JDK 17 on PATH
if (javaHome) {
  env.PATH = path.join(javaHome, "bin") + path.delimiter + env.PATH;
}

const localProps = path.join(androidDir, "local.properties");
fs.writeFileSync(localProps, `sdk.dir=${sdk.replace(/\\/g, "/")}\n`);

console.log("Building debug APK…");
const r = spawnSync(gradlew, ["assembleDebug", "--no-daemon"], {
  cwd: androidDir,
  env,
  stdio: "inherit",
  shell: isWin,
});

if (r.status !== 0) {
  console.error("Gradle build failed");
  process.exit(r.status || 1);
}

const apk = path.join(
  androidDir,
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk"
);
const outDir = path.join(root, "dist-apk");
fs.mkdirSync(outDir, { recursive: true });
const dest = path.join(outDir, "HallsOfTorment-debug.apk");
if (fs.existsSync(apk)) {
  fs.copyFileSync(apk, dest);
  console.log("\nAPK ready:\n ", dest);
} else {
  console.error("APK not found at", apk);
  process.exit(1);
}

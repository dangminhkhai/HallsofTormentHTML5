# Install Android command-line tools + platform packages (no Android Studio UI)
# Requires: JDK 17, network

$ErrorActionPreference = "Stop"
$SdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$CmdToolsZip = Join-Path $env:TEMP "android-cmdline-tools.zip"
$CmdToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

Write-Host "SDK root: $SdkRoot"
New-Item -ItemType Directory -Force -Path $SdkRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $SdkRoot "cmdline-tools") | Out-Null

if (-not (Test-Path (Join-Path $SdkRoot "cmdline-tools\latest\bin\sdkmanager.bat"))) {
  Write-Host "Downloading Android command-line tools…"
  Invoke-WebRequest -Uri $CmdToolsUrl -OutFile $CmdToolsZip
  $extract = Join-Path $env:TEMP "android-cmdline-tools-extract"
  if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
  Expand-Archive -Path $CmdToolsZip -DestinationPath $extract -Force
  $latest = Join-Path $SdkRoot "cmdline-tools\latest"
  if (Test-Path $latest) { Remove-Item $latest -Recurse -Force }
  # zip contains "cmdline-tools" folder
  $inner = Get-ChildItem $extract -Directory | Select-Object -First 1
  Move-Item $inner.FullName $latest
  Write-Host "cmdline-tools installed"
} else {
  Write-Host "cmdline-tools already present"
}

$sdkmanager = Join-Path $SdkRoot "cmdline-tools\latest\bin\sdkmanager.bat"
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot

# Accept licenses + install packages
$packages = @(
  "platform-tools",
  "platforms;android-34",
  "build-tools;34.0.0"
)

Write-Host "Installing SDK packages…"
$yes = "y`n" * 50
$packages | ForEach-Object {
  Write-Host "  -> $_"
  cmd /c "echo y| `"$sdkmanager`" --sdk_root=`"$SdkRoot`" $_"
}

Write-Host "Accepting licenses…"
cmd /c "echo y| `"$sdkmanager`" --sdk_root=`"$SdkRoot`" --licenses"

Write-Host ""
Write-Host "Done. Set for this session:"
Write-Host "  `$env:ANDROID_HOME = '$SdkRoot'"
Write-Host "  `$env:ANDROID_SDK_ROOT = '$SdkRoot'"
Write-Host "Then: npm run build:apk"

# Android APK (offline)

Bản **debug APK** chơi offline qua WebView (Capacitor).

## File cài sẵn

```
dist-apk/HallsOfTorment-debug.apk
```

### Cài trên điện thoại

1. Copy APK sang máy (USB, Drive, Telegram…).
2. Mở file → **Cài đặt** (bật “Nguồn không xác định” / Install unknown apps nếu hỏi).
3. Mở app **Halls of Torment** — không cần mạng.

> Debug APK **không** lên Play Store (chữ ký debug). Đủ để test.

### Gỡ cài

Cài đặt → Ứng dụng → Halls of Torment → Gỡ.

---

## Build lại sau khi sửa game

Cần:

- **Node.js**
- **JDK 17** (`JAVA_HOME`)
- **Android SDK** (`ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`)

```powershell
cd C:\Users\Khai\halls-of-torment

# (lần đầu) cài SDK nếu chưa có
# powershell -ExecutionPolicy Bypass -File scripts\setup-android-sdk.ps1
# Lưu ý: chạy sdkmanager với JDK 17

$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

npm install
npm run build:apk
```

APK ra: `dist-apk/HallsOfTorment-debug.apk`

Hoặc:

```powershell
npm run sync:www
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

## Ghi chú

| | |
|--|--|
| Package | `com.dangminhkhai.hallsoftorment` |
| Offline | Toàn bộ asset trong APK |
| Save | `localStorage` WebView (giữ khi mở lại app) |
| Hướng màn | Portrait + landscape |
| Màn hình | Fullscreen, keep screen on |

Sửa code web → `npm run build:apk` để đóng gói lại.

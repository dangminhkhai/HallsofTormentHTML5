# Android APK (offline)

Bản **debug APK** chơi offline qua WebView (Capacitor).

## File cài sẵn (trong repo)

```
dist-apk/HallsOfTorment-debug.apk
```

| | |
|--|--|
| Package | `com.dangminhkhai.hallsoftorment` |
| Loại | Debug (test, không Play Store) |
| Mạng | **Không cần** — asset trong APK |
| Save | `localStorage` WebView |

### Cài trên điện thoại

1. Tải APK từ repo (`dist-apk/…`) hoặc copy từ máy.
2. Mở file → **Cài đặt** (bật “Nguồn không xác định” nếu hỏi).
3. Mở **Halls of Torment**.

> Cài đè bản cũ: gỡ app trước nếu Android từ chối cập nhật (chữ ký debug khác).

### Gỡ cài

Cài đặt → Ứng dụng → Halls of Torment → Gỡ.

---

## Build lại sau khi sửa game

Cần: **Node.js** · **JDK 17** · **Android SDK**

```powershell
cd C:\Users\Khai\halls-of-torment

$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

npm install
npm run build:apk
```

Output: `dist-apk/HallsOfTorment-debug.apk`

Hoặc:

```powershell
npm run sync:www
npx cap sync android
cd android
.\gradlew.bat assembleDebug
# copy app\build\outputs\apk\debug\app-debug.apk → dist-apk\
```

Lần đầu SDK: `scripts/setup-android-sdk.ps1` (chạy `sdkmanager` với **JDK 17**).

---

## Ghi chú UX mobile (đã đóng gói)

- HUD trên: **time** giữa · Máu / EXP / Vàng / Mạng  
- World zoom portrait ×1.48  
- Stick = tốc độ hero  
- Rương: legend độ hiếm góc phải  
- Cuộn Bậc thầy: card tên + chip chỉ số  

Sửa web → `npm run build:apk` → commit APK nếu cần phát hành test.

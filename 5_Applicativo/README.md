# X2SevenVault – Getting Started

This guide explains how to run all three applications that make up the X2SevenVault system: the Laravel backend, the React web dashboard, and the Expo mobile app.

---

## Prerequisites

Make sure you have the following installed before proceeding:

- **PHP** >= 8.1 and **Composer**
- **Node.js** >= 18 and **npm**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** with Android SDK (for mobile app native build)

---

## 1. Backend (Laravel)

```bash
cd x2sevenvault-master\5_Applicativo\backend
composer install
php artisan serve
```

The API will be available at `http://127.0.0.1:8000`.

---

## 2. Web Dashboard (React)

```bash
cd x2sevenvault-master\5_Applicativo\frontend
npm i
npm run dev
```

The dashboard will be available at `http://localhost:5173` (or the port shown in the terminal).

---

## 3. Mobile App (Expo / React Native)

```bash
cd x2sevenvault-master\5_Applicativo\X2SevenVault
npm i
npx expo run:android
```

> **Note:** Use `npx expo start` instead if you want to run the app via Expo Go on a physical device. In this case, the device must be connected to the **same Wi-Fi network** as your PC.

---

## Troubleshooting – Android SDK not found

If the native Android build fails with an SDK-related error, follow these steps:

1. Navigate to the folder:
   ```
   x2sevenvault-master\5_Applicativo\X2SevenVault\android\
   ```

2. Create a new file named `local.properties` (no extension).

3. Open it with Notepad and add the following line, replacing `YOUR_USER` with your Windows username:
   ```properties
   sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
   ```

4. Save the file and run `npx expo run:android` again.
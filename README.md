# X2SevenVault

X2SevenVault is a smart warehouse management system that combines a web dashboard, a mobile app, and an AI model to streamline the identification and cataloguing of warehouse items.

## What it does

The system allows warehouse operators to scan physical objects using the mobile app's camera. A custom-trained AI model identifies the object and retrieves its information (name, location, physical properties) directly from the database. Administrators can manage the entire warehouse structure — warehouses, aisles, shelves, and items — through the web dashboard.

## Key Features

- **AI object recognition** — custom model that identifies catalogued items from a camera feed with over 85% accuracy
- **Warehouse management** — full CRUD for warehouses, aisles, shelves, and items via web dashboard
- **Role-based access** — admin and operator roles with protected routes and Firebase authentication
- **Guest mode** — read-only access to the item catalogue without credentials
- **Real-time sync** — mobile app and dashboard share the same Firestore database

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel (PHP) |
| Web Dashboard | React + TypeScript |
| Mobile App | React Native (Expo) |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| AI Model | Custom trained model |

## Project Structure

```
x2sevenvault-master/
└── 5_Applicativo/
    ├── backend/          # Laravel REST API
    ├── frontend/         # React web dashboard
    └── X2SevenVault/     # Expo mobile app
```

---

*Developed by Christian Arzani*
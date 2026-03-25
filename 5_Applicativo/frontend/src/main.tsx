import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { StrictMode } from 'react'
import { AuthProvider } from './app/context/AuthContext.tsx'
import { DataProvider } from './app/data/store.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <DataProvider>
                <App />
            </DataProvider>
        </AuthProvider>
    </StrictMode>
)
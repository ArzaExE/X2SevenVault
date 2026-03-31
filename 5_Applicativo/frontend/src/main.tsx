import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { StrictMode } from 'react'
import { AuthProvider } from './app/context/AuthContext.tsx'
import { ItemsProvider } from "./app/context/ItemsContext.tsx";
// import { DataProvider } from './app/data/store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ItemsProvider>
        <App />
      </ItemsProvider>
    </AuthProvider>
  </StrictMode>
);
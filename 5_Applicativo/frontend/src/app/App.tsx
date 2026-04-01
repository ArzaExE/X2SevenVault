import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from 'react-hot-toast';

export default function App() {
    return (
        <>
            <Toaster
            position="top-right"
            toastOptions={{
                // Stile base per tutti i toast
                style: {
                    background: '#18181b', // zinc-900
                    color: '#fff',
                    border: '1px solid #27272a', // zinc-800
                    borderRadius: '8px',
                },
                // Personalizzazione per successo
                success: {
                iconTheme: {
                    primary: '#2563eb', // blue-600 (coerente con il tuo bottone)
                    secondary: '#fff',
                },
                },
                // Personalizzazione per errore
                error: {
                    iconTheme: {
                        primary: '#ef4444', // red-500
                        secondary: '#fff',
                    },
                },
            }}
            />
            <RouterProvider router={router} />
        </>
    );
}
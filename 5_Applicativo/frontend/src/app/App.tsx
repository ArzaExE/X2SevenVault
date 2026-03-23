import { RouterProvider } from "react-router";
import { DataProvider } from "./data/store";
import { router } from "./routes";

export default function App() {
  return (
    <DataProvider>
      <RouterProvider router={router} />
    </DataProvider>
  );
}

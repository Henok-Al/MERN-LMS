import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./context/auth-context";
import { ThemeProvider } from "./components/ui/theme-provider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="lms-ui-theme">
        <AuthProvider>
          <App />
          <Toaster position="top-center" closeButton richColors />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
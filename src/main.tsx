import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <App />
              <Toaster 
                position="top-right" 
                containerStyle={{
                  top: 100,         
                  right: 50,
                  zIndex: 99999,
                }}/>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { I18nProvider } from "./i18n/I18nContext";
import { TrainerProvider } from "./state/TrainerContext";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/poppins/600.css";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <TrainerProvider>
        <App />
      </TrainerProvider>
    </I18nProvider>
  </React.StrictMode>
);


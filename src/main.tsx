const APP_VERSION = '2026.03.09.05'; // <-- Change this number to force an update

if (localStorage.getItem('v_cache') !== APP_VERSION) {
  // 1. Clear all Service Workers
  navigator.serviceWorker?.getRegistrations().then(regs => regs.forEach(r => r.unregister()));

  // 2. Clear all Browser Caches
  caches.keys().then(names => {
    for (let name of names) caches.delete(name);
  });

  // 3. Update version and Hard Reload
  localStorage.setItem('v_cache', APP_VERSION);
  window.location.reload();
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

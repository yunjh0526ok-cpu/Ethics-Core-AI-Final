import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const notifyUpdateReady = (registration: ServiceWorkerRegistration) => {
  window.dispatchEvent(new CustomEvent('app-update-ready', { detail: registration }));
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
      if (registration.waiting) {
        notifyUpdateReady(registration);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            notifyUpdateReady(registration);
          }
        });
      });

      registration.update().catch(() => {
        /* ignore */
      });
    }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
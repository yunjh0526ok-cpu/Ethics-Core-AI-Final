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
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              notifyUpdateReady(registration);
            }
          });
        });

        registration.update().catch(() => {
          /* ignore */
        });
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });

  /** 사용자가「지금 업데이트」를 눌렀을 때만 새로고침 — 첫 SW 활성화마다 리로드하면 설치/프롬프트가 끊길 수 있음 */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    try {
      if (sessionStorage.getItem('eca-sw-reload-pending') === '1') {
        sessionStorage.removeItem('eca-sw-reload-pending');
        window.location.reload();
      }
    } catch {
      /* ignore */
    }
  });
}
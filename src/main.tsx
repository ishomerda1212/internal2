import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// グローバルエラーハンドラーを追加
window.addEventListener('error', (event) => {
  console.error('グローバルエラー:', event.error);
  console.error('エラー詳細:', {
    message: event.error?.message,
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未処理のPromise拒否:', event.reason);
  console.error('Promise拒否詳細:', {
    reason: event.reason,
    promise: event.promise
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

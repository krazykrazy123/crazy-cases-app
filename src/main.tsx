import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './index.css'; // if you have global styles, keep it; otherwise delete this line

// Optional: if you need Suspense for lazy loading in future, keep it; otherwise remove
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl="https://your-vercel-url.vercel.app/tonconnect-manifest.json"
      // actionsConfiguration only if needed — remove if causing issues
      // actionsConfiguration={{ twaReturnUrl: "https://t.me/CrazyCasesChat" }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TonConnectUIProvider>
  </React.StrictMode>
);
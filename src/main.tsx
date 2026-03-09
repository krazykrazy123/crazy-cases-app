import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './index.css'; // if you have global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl="https://your-real-domain.com/tonconnect-manifest.json">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TonConnectUIProvider>
  </React.StrictMode>
);
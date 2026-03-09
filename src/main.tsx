import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './index.css';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: 'red', padding: '50px', fontSize: '20px', background: 'black' }}>
      {children}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TonConnectUIProvider manifestUrl="https://crazy-cases-app-test.vercel.app/tonconnect-manifest.json">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TonConnectUIProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
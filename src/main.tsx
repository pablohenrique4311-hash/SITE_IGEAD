import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';

// Inicia o registro do Service Worker para suporte PWA e offline
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);

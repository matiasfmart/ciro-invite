import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/dm-sans';
import '@fontsource/lilita-one/400.css';
import './themes/storybook.css';
import './themes/journey.css';
import './themes/living.css';
import './themes/poster.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
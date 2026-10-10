import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/dm-sans';
import './themes/storybook.css';
import './themes/journey.css';
import './themes/living.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
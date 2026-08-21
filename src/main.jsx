import React from 'react';
import { createRoot } from 'react-dom/client';
/* Fuentes para la herramienta de texto, servidas desde el propio origen (sin CDN).
   Solo el subconjunto latino: cubre el español (acentos y ñ) sin cargar cirílico,
   griego, etc. */
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-400-italic.css';
import '@fontsource/inter/latin-700-italic.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-400-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/caveat/latin-400.css';
import '@fontsource/caveat/latin-700.css';
import App from './App.jsx';


createRoot(document.getElementById('root')).render(<App />);

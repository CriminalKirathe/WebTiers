// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // თქვენი მთავარი App კომპონენტი
import './index.css' // ან თქვენი გლობალური სტილები

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* App კომპონენტს აღარ სჭირდება საკუთარი BrowserRouter, თუ ის აქ არის */}
    <App /> 
  </React.StrictMode>,
)
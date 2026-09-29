import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preloadAllMuseumAssets } from './utils/preloadAssets'

// Kích hoạt nạp trước toàn bộ tài nguyên hình ảnh & 3D textures
preloadAllMuseumAssets()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

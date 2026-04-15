import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { router } from './router.jsx'
import { QueryProvider } from './providers/QueryProvider.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'font-medium',
        }}
      />
    </QueryProvider>
  </StrictMode>
)

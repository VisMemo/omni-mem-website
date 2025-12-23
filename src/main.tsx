import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import './index.css'

const App = React.lazy(() => import('./app').then((module) => ({ default: module.App })))

function Root() {
  return (
    <NextUIProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-muted">
            Loading Omni Memory...
          </div>
        }
      >
        <App />
      </Suspense>
    </NextUIProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

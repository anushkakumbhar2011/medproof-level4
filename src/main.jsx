import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { RecordsProvider } from './context/RecordsContext'
import { EventsProvider } from './context/EventsContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App'
import './index.css'

console.log('main.jsx executing')

const root = document.getElementById('root')

if (!root) {
  console.error('Root element not found!')
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <RecordsProvider>
            <EventsProvider>
              <App />
            </EventsProvider>
          </RecordsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}

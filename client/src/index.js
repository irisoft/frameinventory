import React from 'react'
import ReactDOM from 'react-dom'
import { FirebaseProvider } from './components/Firebase.context'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(
  (
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  ), document.getElementById('root'),
)

registerServiceWorker()

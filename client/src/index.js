import React from 'react'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'

import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

const config = {
  apiKey: 'AIzaSyACJZRIfTh-d-pFZysS5j0aZfjfGwVHMP8',
  authDomain: 'irisoft-inventory.firebaseapp.com',
  databaseURL: 'https://irisoft-inventory.firebaseio.com',
  projectId: 'irisoft-inventory',
  storageBucket: 'irisoft-inventory.appspot.com',
  messagingSenderId: '72953003686',
}

const firebaseApp = firebase.initializeApp(config)

const firestoreSettings = {
  timestampsInSnapshots: true,
}
firebase.firestore().settings(firestoreSettings)


ReactDOM.render(<App firebaseApp={firebaseApp} />, document.getElementById('root'))
registerServiceWorker()

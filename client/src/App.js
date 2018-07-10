import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import FirebaseProtectedRoute from './components/FirebaseProtectedRoute'
import NoAuthContainer from './views/NoAuthContainer'
import AuthContainer from './views/auth/AuthContainer'
import TopNavBar from './components/TopNavBar'

function App({ firebaseApp }) {
  return (
    <Router>
      <div>
        <TopNavBar firebaseApp={firebaseApp} />
        <NoAuthContainer firebaseApp={firebaseApp} />
        <div className="max-height">
          <FirebaseProtectedRoute path="/auth" component={AuthContainer} firebaseApp={firebaseApp} />
        </div>
      </div>
    </Router>
  )
}

export default App


// green #8dc600
// blue  #007494
// red   #EF476F
// orang #FFD166

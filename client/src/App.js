import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react'
import NoAuthContainer from './views/NoAuthContainer'
import AuthContainer from './views/auth/AuthContainer'
import TopNavBar from './components/TopNavBar'
import './App.css'

const config = {
  issuer: 'https://dev-924982.oktapreview.com/oauth2/default',
  redirect_uri: `${window.location.origin}/implicit/callback`,
  client_id: '0oaecgijbzWW1fNFC0h7',
}

function onAuthRequired({ history }) {
  history.push('/sign-in')
}

function App() {
  return (
    <Router>
      <Security
        issuer={config.issuer}
        client_id={config.client_id}
        redirect_uri={config.redirect_uri}
        onAuthRequired={onAuthRequired}
      >
        <TopNavBar />
        <NoAuthContainer />
        <Route path="/implicit/callback" component={ImplicitCallback} />
        <div className="max-height">
          <SecureRoute path="/auth" component={AuthContainer} />
        </div>
      </Security>
    </Router>
  )
}

export default App


// green #8dc600
// blue  #007494
// red   #EF476F
// orang #FFD166

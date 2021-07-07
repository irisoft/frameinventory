import React from 'react'
import { Route } from 'react-router-dom'
import Home from './Home'
import SignIn from './SignIn'

function NoAuthContainer() {
  return (
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/sign-in" render={() => <SignIn />} />
    </div>
  )
}

export default NoAuthContainer

import React from 'react'
import { Route } from 'react-router-dom'
import Home from './Home'
import SignIn from './SignIn'
import SignUp from './SignUp'
import About from './About'

function NoAuthContainer() {
  return (
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/sign-in" render={() => <SignIn baseUrl="https://dev-924982.oktapreview.com" />} />
      <Route path="/sign-up" component={SignUp} />
    </div>
  )
}

NoAuthContainer.propTypes = {
}

NoAuthContainer.defaultProps = {

}

export default NoAuthContainer

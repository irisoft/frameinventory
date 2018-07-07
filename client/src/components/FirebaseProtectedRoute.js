/* global firebase */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-dom'

class FirebaseProtectedRoute extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSignedIn: undefined,
    }
  }

  componentDidMount() {
    try {
      this.unregisterAuthObserver = firebase.app().auth().onAuthStateChanged((user) => {
        this.setState({ isSignedIn: !!user })
      })
    } catch (error) {
      this.setState({ isSignedIn: false })
    }
  }

  componentWillUnmount() {
    this.unregisterAuthObserver()
  }

  render() {
    const { component: RouteComponent, ...rest } = this.props
    const { isSignedIn } = this.state

    return (
      <Route
        {...rest}
        render={props => (
          isSignedIn === true
            ? <RouteComponent {...props} />
            : <Redirect to="/sign-in" />
        )}
      />
    )
  }
}

FirebaseProtectedRoute.propTypes = {
  component: PropTypes.node.isRequired,
}

FirebaseProtectedRoute.defaultProps = {

}

export default FirebaseProtectedRoute

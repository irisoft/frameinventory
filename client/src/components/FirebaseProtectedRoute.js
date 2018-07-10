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
    const { firebaseApp } = this.props
    try {
      this.unregisterAuthObserver = firebaseApp.auth().onAuthStateChanged((user) => {
        this.setState({ isSignedIn: !!user })
      })
    } catch (error) {
      this.setState({ isSignedIn: false })
    }
  }

  componentWillUnmount() {
    if (typeof this.unregisterAuthObserver === 'function') this.unregisterAuthObserver()
  }

  render() {
    const { component: RouteComponent, ...rest } = this.props
    const { isSignedIn } = this.state

    return (
      <Route
        {...rest}
        render={(props) => {
          if (isSignedIn === true) return (<RouteComponent {...props} />)
          else if (isSignedIn === false) return (<Redirect to="/sign-in" />)
          return null
        }}
      />
    )
  }
}

FirebaseProtectedRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
  ]).isRequired,
}

FirebaseProtectedRoute.defaultProps = {

}

export default FirebaseProtectedRoute

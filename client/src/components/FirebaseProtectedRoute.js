import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-dom'
import withFirebase from '../hocs/withFirebase'

function FirebaseProtectedRoute(props) {
  const { component: RouteComponent, ...rest } = props
  const { isSignedIn } = rest
  return (
    <Route
      {...rest}
      render={(renderProps) => {
        if (isSignedIn === true) return (<RouteComponent {...renderProps} />)
        else if (isSignedIn === false) return (<Redirect to="/sign-in" />)
        return null
      }}
    />
  )
}

FirebaseProtectedRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
  ]).isRequired,
}

FirebaseProtectedRoute.defaultProps = {

}

export default withFirebase(FirebaseProtectedRoute)

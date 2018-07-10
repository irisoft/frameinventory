import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseui from 'firebaseui'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide
  // a callbacks.signInSuccess function.
  signInSuccessUrl: '/auth/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  callbacks: {
    signInSuccessWithAuthResult: (authResult, redirectUrl) => {
      console.log(authResult)
      console.log(redirectUrl)
      return true
    },
  },
}

class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSignedIn: undefined,
    }
  }

  componentDidMount() {
    try {
      this.unregisterAuthObserver = this.props.firebaseApp.auth().onAuthStateChanged((user) => {
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
    const { isSignedIn } = this.state
    return (
      <div>
        { isSignedIn && <Redirect to="/auth/" /> }
        { isSignedIn === false && <div className="w-100 mt5 tc">
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={this.props.firebaseApp.auth()} />
        </div>}
      </div>
    )
  }
}

LoginForm.propTypes = {
  auth: PropTypes.shape({
    redirect: PropTypes.func,
  }),
  baseUrl: PropTypes.string,
}

LoginForm.defaultProps = {
  auth: null,
  baseUrl: null,
}

export default LoginForm

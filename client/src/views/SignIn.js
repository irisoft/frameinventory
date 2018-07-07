/* global firebase, firebaseApp */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import firebaseui from 'firebaseui'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'

// Configure FirebaseUI.
let uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide
  // a callbacks.signInSuccess function.
  signInSuccessUrl: '/auth/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  callbacks: {
    signInSuccessWithAuthResult: (authResult, redirectUrl) => {
      console.log(authResult)
      console.log(redirectUrl)
      return true
    },
    signInSuccess: () => {
      console.log('woot!')
    },
  },
}

uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
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
      this.unregisterAuthObserver = firebaseApp.auth().onAuthStateChanged((user) => {
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
    const { isSignedIn } = this.state
    return isSignedIn
      ? (<Redirect to="/auth/" />)
      : (
        <div className="w-100 mt5 tc">
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseApp.auth()} />
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

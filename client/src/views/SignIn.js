import React from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/auth'
import firebaseui from 'firebaseui'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import withFirebase from '../hocs/withFirebase'

const firebaseUIConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/auth/',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
}

function LoginForm({ isSignedIn, firebaseApp }) {
  return (
    <div>
      { isSignedIn && <Redirect to="/auth/" /> }
      { isSignedIn === false && (
        <div className="w-100 mt5 tc">
          <StyledFirebaseAuth uiConfig={firebaseUIConfig} firebaseAuth={firebaseApp.auth()} />
        </div>
      )}
    </div>
  )
}

LoginForm.propTypes = {
  firebaseApp: PropTypes.shape({}).isRequired,
  isSignedIn: PropTypes.oneOf([undefined, true, false]),
}

LoginForm.defaultProps = {
  isSignedIn: undefined,
}

export default withFirebase(LoginForm)

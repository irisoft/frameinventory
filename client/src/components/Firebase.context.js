import React, { Component } from 'react'
import PropTypes from 'prop-types'
import firebase from 'firebase/app'
import 'firebase/firestore'
import User from '../dao/User'
import Organization from '../dao/Organization'

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyACJZRIfTh-d-pFZysS5j0aZfjfGwVHMP8',
  authDomain: 'irisoft-inventory.firebaseapp.com',
  databaseURL: 'https://irisoft-inventory.firebaseio.com',
  projectId: 'irisoft-inventory',
  storageBucket: 'irisoft-inventory.appspot.com',
  messagingSenderId: '72953003686',
}

const FIRESTORE_CONFIG = {
  timestampsInSnapshots: true,
}

const DEFAULT_STATE = {
  isSignedIn: undefined,
  user: null,
  firebaseApp: firebase.initializeApp(FIREBASE_CONFIG),
  userProfile: null,
  organization: null,
}

firebase.firestore().settings(FIRESTORE_CONFIG)

export const FirebaseContext = React.createContext(DEFAULT_STATE)

export const FirebaseConsumer = FirebaseContext.Consumer

export class FirebaseProvider extends Component {
  constructor(props) {
    super(props)
    this.state = DEFAULT_STATE
  }

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */

    const { firebaseApp } = this.state
    try {
      this.unregisterAuthObserver = firebaseApp.auth().onAuthStateChanged(async (user) => {
        let userProfile
        let organization
        if (user) {
          userProfile = await User.load(user.uid)
          if (userProfile && userProfile.organizationId) {
            organization = await Organization.load(userProfile.organizationId)
          }
        }
        this.setState({
          isSignedIn: !!user, user, userProfile, organization,
        })
      })
    } catch (error) {
      this.setState({ isSignedIn: false, user: null })
    }
  }

  componentWillUnmount() {
    if (typeof this.unregisterAuthObserver === 'function') this.unregisterAuthObserver()
  }

  render() {
    const { children } = this.props
    const {
      isSignedIn, user, firebaseApp, userProfile, organization,
    } = this.state

    return (
      <FirebaseContext.Provider
        value={{
          isSignedIn,
          user,
          firebaseApp,
          userProfile,
          organization,
        }}
      >
        {children}
      </FirebaseContext.Provider>
    )
  }
}

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

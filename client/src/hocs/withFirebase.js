import React from 'react'
import { FirebaseConsumer } from '../components/Firebase.context'

export default function withFirebase(Component) {
  function FirebaseComponent(props) {
    return (
      <FirebaseConsumer>
        {context => <Component {...props} {...context} />}
      </FirebaseConsumer>
    )
  }

  return FirebaseComponent
}

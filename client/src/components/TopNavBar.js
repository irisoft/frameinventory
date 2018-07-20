import React, { Component } from 'react'
import PropTypes from 'prop-types'
import withFirebase from '../hocs/withFirebase'
import logo from '../assets/fifo-logo-white.svg'
import RoundButton from '../components/RoundButton'

class TopNavBar extends Component {
  constructor(props) {
    super(props)
    this.toggleNavbar = this.toggleNavbar.bind(this)
    this.state = { isOpen: false }
  }

  toggleNavbar() {
    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  render() {
    const {
      isSignedIn, user, firebaseApp, organization,
    } = this.props
    return (
      <header className="fixed w-100 top-0" style={{ zIndex: 1 }}>
        <nav className="w-100 pa3 flex items-center justify-between bg-dark-gray">
          <img alt="Irisoft Logo" height={48} src={logo} />
          <div className="tr">
            { isSignedIn
              ? <RoundButton mini color="isgreen" textColor="white" onClick={() => { firebaseApp.auth().signOut() }} label={`Logout (${user.displayName})`} />
              : <RoundButton mini color="isgreen" textColor="white" onClick={() => {}} label="Login" />
            }
          </div>
        </nav>
        { organization && (
          <div className="w-100 pv2 ph3 f7 bg-near-black gray tr">
            {organization.name}
          </div>
        )}
      </header>
    )
  }
}

TopNavBar.propTypes = {
  firebaseApp: PropTypes.shape({}).isRequired,
  isSignedIn: PropTypes.oneOf([undefined, true, false]),
  user: PropTypes.shape({
    displayName: PropTypes.string,
  }),
}

TopNavBar.defaultProps = {
  isSignedIn: undefined,
  user: null,
}

export default withFirebase(TopNavBar)

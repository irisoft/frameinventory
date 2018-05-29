import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withAuth } from '@okta/okta-react'
// import JsonApi from './JsonApi'
import FirestoreApi from './FirestoreApi'

function withAPI(WrappedComponent) {
  class API extends Component {
    constructor(props) {
      super(props)
      this.state = {
        authenticated: null,
      }
      this.checkAuthentication = this.checkAuthentication.bind(this)
      this.checkAuthentication()
    }

    componentDidUpdate() {
      this.checkAuthentication()
    }

    async checkAuthentication() {
      const authenticated = await this.props.auth.isAuthenticated()
      if (authenticated !== this.state.authenticated) {
        this.api = FirestoreApi(await this.props.auth.getAccessToken())
        this.setState({ authenticated })
      }
    }

    render() {
      if (!this.state.authenticated) return null
      return (
        <WrappedComponent
          auth={this.props.auth}
          api={this.api}
          authenticated={this.state.authenticated}
        />
      )
    }
  }

  API.propTypes = {
    auth: PropTypes.shape({
      isAuthenticated: PropTypes.func,
      logout: PropTypes.func,
      login: PropTypes.func,
      getAccessToken: PropTypes.func,
    }),
  }

  API.defaultProps = {
    auth: {},
  }

  return withAuth(API)
}

export default withAPI

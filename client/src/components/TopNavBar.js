import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, NavbarToggler, Collapse } from 'reactstrap'
import { withAuth } from '@okta/okta-react'
import { Link } from 'react-router-dom'
import logo from '../assets/company-logo-white.png'

class TopNavBar extends Component {
  constructor(props) {
    super(props)
    this.toggleNavbar = this.toggleNavbar.bind(this)
    this.state = { authenticated: null, isOpen: false }
    this.checkAuthentication = this.checkAuthentication.bind(this)
    this.checkAuthentication()
  }

  componentDidUpdate() {
    this.checkAuthentication()
  }

  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated()
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated })
    }
  }

  toggleNavbar() {
    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  render() {
    return (
      <Navbar color="dark" fixed="top" light expand="md">
        <NavbarBrand>
          <img alt="Irisoft Logo" height={18} src={logo} />
        </NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav navbar className="mr-auto">
            <NavItem>
              <NavLink tag={Link} to="/">Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/about">About</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/sign-up">Register</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/auth/">Inventory</NavLink>
            </NavItem>
          </Nav>
          <span className="navbar-text">
            { this.state.authenticated
              ? <button className="btn btn-default" onClick={this.props.auth.logout}>Logout</button>
              : <button className="btn btn-default" onClick={this.props.auth.login}>Login</button>
            }
          </span>
        </Collapse>
      </Navbar>
    )
  }
}

TopNavBar.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.func,
    logout: PropTypes.func,
    login: PropTypes.func,
  }),
}

TopNavBar.defaultProps = {
  auth: null,
}

export default withAuth(TopNavBar)

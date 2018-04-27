import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import { Navbar, NavbarBrand, Nav, NavItem, NavLink, NavbarToggler, Collapse } from 'reactstrap'
import { withAuth } from '@okta/okta-react'
import { Link } from 'react-router-dom'
import logo from '../assets/company-logo-white.png'
import RoundButton from './RoundButton'

class TopNavBar extends Component {
  constructor(props) {
    super(props)
    this.toggleNavbar = this.toggleNavbar.bind(this)
    this.state = { authenticated: false, isOpen: false }
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
      <header className="fixed w-100 top-0" style={{ zIndex: 1 }}>
        <nav className="w-100 pa3 flex items-center justify-between bg-dark-gray">
          <img alt="Irisoft Logo" height={18} src={logo} />
          <div className="tr">
            {/* <Link className="f6 fw4 hover-white no-underline white-70 dn dib-ns pv2 ph3" to="/">Home</Link>
              <Link className="f6 fw4 hover-white no-underline white-70 dn dib-ns pv2 ph3" to="/about">About</Link>
              <Link className="f6 fw4 hover-white no-underline white-70 dn dib-ns pv2 ph3" to="/sign-up">Register</Link>
            <Link className="f6 fw4 hover-white no-underline white-70 dn dib-ns pv2 ph3" to="/auth/">Inventory</Link> */}
            { this.state.authenticated
              ? <RoundButton mini color="isgreen" textColor="white" onClick={this.props.auth.logout} label="Logout" />
              : <RoundButton mini color="isgreen" textColor="white" onClick={this.props.auth.login} label="Login" />
            }
          </div>
        </nav>
      </header>
      // <Navbar color="dark" fixed="top" light expand="md">
      //   <NavbarBrand>
      //
      //   </NavbarBrand>
      //   <NavbarToggler onClick={this.toggleNavbar} />
      //   <Collapse isOpen={this.state.isOpen} navbar>
      //     <Nav navbar className="mr-auto">
      //       <NavItem>
      //         <NavLink tag={Link} to="/">Home</NavLink>
      //       </NavItem>
      //       <NavItem>
      //
      //       </NavItem>
      //       <NavItem>
      //
      //       </NavItem>
      //       <NavItem>
      //
      //       </NavItem>
      //     </Nav>
      //     <span className="navbar-text">

      //     </span>
      //   </Collapse>
      // </Navbar>
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

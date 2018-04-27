import React, { Component } from 'react'
import PropTypes from 'prop-types'
import OktaAuth from '@okta/okta-auth-js'
import { withAuth } from '@okta/okta-react'
// import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap'
import Container from '../components/Container'
import RoundButton from '../components/RoundButton'
import logo from '../assets/company-logo-white.png'

class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sessionToken: null,
      username: '',
      password: '',
      error: false,
    }

    this.form = null

    this.oktaAuth = new OktaAuth({ url: props.baseUrl })

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUsernameChange = this.handleUsernameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
  }

  handleSubmit(e) {
    if ('preventDefault' in e) {
      e.preventDefault()
    }

    this.oktaAuth.signIn({
      username: this.state.username,
      password: this.state.password,
    })
      .then(res => this.setState({
        sessionToken: res.sessionToken,
      }))
      .catch(({ message: error }) => {
        this.setState({ error })
      })
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value })
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value })
  }

  render() {
    const { error } = this.state

    if (this.state.sessionToken) {
      this.props.auth.redirect({ sessionToken: this.state.sessionToken })
      return null
    }

    return (
      <Container>
        <section className="mv3">
          <article className="black-80 bg-white pa5 mt4 shadow-1 br2">
            <div className="mt3 w-60 center">
              <img alt="Irisoft Logo" className="" src={logo} />
            </div>
            {error &&
              <div className="mt4 w-60 center pa3 bg-red br2 tc white">
                {error}
              </div>
            }
            <form onSubmit={this.handleSubmit}>
              <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                <legend className="ph0 mh0 fw6 clip">Sign Up</legend>
                <div className="mt3 w-60 center">
                  <label className="db fw4 lh-copy f6 mb2 moon-gray" htmlFor="email">Email address</label>
                  <input
                    className="pa3 br2 f5 b--moon-gray input-reset ba bg-transparent w-100 gray"
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Your Email"
                    value={this.state.username}
                    onChange={this.handleUsernameChange}
                  />
                </div>
                <div className="mt4 w-60 center">
                  <label className="db fw4 lh-copy f6 mb2 moon-gray" htmlFor="password">Password</label>
                  <input
                    className="pa3 br2 f5 b--moon-gray input-reset ba bg-transparent w-100 gray"
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Your Password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                  />
                </div>
              </fieldset>
              <div className="mt4 w-60 center">
                <RoundButton full color="isgreen" textColor="white" label="Sign In" onClick={this.handleSubmit} />
              </div>
            </form>
          </article>
        </section>
      </Container>
    )
    // <Container>
    //   <Row>
    //     <Col>
    //       <h1 className="f3">Sign In</h1>
    //       <Form inline onSubmit={this.handleSubmit}>
    //         <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
    //           <Label for="email" className="mr-sm-2">Email</Label>
    //           <Input type="email" name="email" id="email" placeholder="Your Email" value={this.state.username} onChange={this.handleUsernameChange} />
    //         </FormGroup>
    //         <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
    //           <Label for="examplePassword" className="mr-sm-2">Password</Label>
    //           <Input type="password" name="password" id="examplePassword" placeholder="Your Password" value={this.state.password} onChange={this.handlePasswordChange} />
    //         </FormGroup>
    //         <Button id="submit" type="submit">Submit</Button>
    //       </Form>
    //     </Col>
    //   </Row>
    // </Container>
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

export default withAuth(LoginForm)

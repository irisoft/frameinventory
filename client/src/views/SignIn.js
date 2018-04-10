import React, { Component } from 'react'
import PropTypes from 'prop-types'
import OktaAuth from '@okta/okta-auth-js'
import { withAuth } from '@okta/okta-react'
// import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap'
import Container from '../components/Container'
import PageHeading from '../components/PageHeading'

class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sessionToken: null,
      username: '',
      password: '',
    }

    this.oktaAuth = new OktaAuth({ url: props.baseUrl })

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUsernameChange = this.handleUsernameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()
    this.oktaAuth.signIn({
      username: this.state.username,
      password: this.state.password,
    })
      .then(res => this.setState({
        sessionToken: res.sessionToken,
      }))
      .catch(err => console.log('Found an error', err))
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value })
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value })
  }

  render() {
    if (this.state.sessionToken) {
      this.props.auth.redirect({ sessionToken: this.state.sessionToken })
      return null
    }

    return (
      <Container>
        <PageHeading>Sign In</PageHeading>
        <article className="black-80">
          <form onSubmit={this.handleSubmit}>
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="ph0 mh0 fw6 clip">Sign Up</legend>
              <div className="mt3">
                <label className="db fw4 lh-copy f6" htmlFor="email">Email address</label>
                <input
                  className="pa2 input-reset ba bg-transparent w-100 measure"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Your Email"
                  value={this.state.username}
                  onChange={this.handleUsernameChange}
                />
              </div>
              <div className="mt3">
                <label className="db fw4 lh-copy f6" htmlFor="password">Password</label>
                <input
                  className="b pa2 input-reset ba bg-transparent"
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Your Password"
                  value={this.state.password}
                  onChange={this.handlePasswordChange}
                />
              </div>
            </fieldset>
            <div className="mt3"><input className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6" type="submit" value="Sign Up" /></div>
          </form>
        </article>
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

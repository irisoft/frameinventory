import React, { Component } from 'react'
import PropTypes from 'prop-types'
import OktaAuth from '@okta/okta-auth-js'
import { withAuth } from '@okta/okta-react'
import { Container, Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap'

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
        <Row>
          <Col>
            <h1 className="page-title">Sign In</h1>
            <Form inline onSubmit={this.handleSubmit}>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="email" className="mr-sm-2">Email</Label>
                <Input type="email" name="email" id="email" placeholder="Your Email" value={this.state.username} onChange={this.handleUsernameChange} />
              </FormGroup>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="examplePassword" className="mr-sm-2">Password</Label>
                <Input type="password" name="password" id="examplePassword" placeholder="Your Password" value={this.state.password} onChange={this.handlePasswordChange} />
              </FormGroup>
              <Button id="submit" type="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
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

export default withAuth(LoginForm)

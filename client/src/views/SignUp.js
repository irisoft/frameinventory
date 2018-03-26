import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { Container, Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap'
import withAPI from '../dataAdapters/withAPI'

class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orgName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    }
  }

  handleSubmit = (e) => {
    const { api } = this.props
    const {
      orgName,
      firstName,
      lastName,
      email,
      password,
    } = this.state
    e.preventDefault()
    api.createOrganization(orgName, firstName, lastName, email, password)
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h1 className="page-title">Sign Up</h1>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup row>
                <Label for="email" sm={2}>Email</Label>
                <Col sm={10}>
                  <Input onChange={this.handleChange} value={this.state.email} type="email" name="email" id="email" placeholder="with a placeholder" />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="password" sm={2}>Password</Label>
                <Col sm={10}>
                  <Input onChange={this.handleChange} value={this.state.password} type="password" name="password" id="password" placeholder="password placeholder" />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="orgName" sm={2}>Text Area</Label>
                <Col sm={10}>
                  <Input onChange={this.handleChange} value={this.state.orgName} type="textarea" name="orgName" id="orgName" />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="firstName" sm={2}>Text Area</Label>
                <Col sm={10}>
                  <Input onChange={this.handleChange} value={this.state.firstName} type="textarea" name="firstName" id="firstName" />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="lastName" sm={2}>Text Area</Label>
                <Col sm={10}>
                  <Input onChange={this.handleChange} value={this.state.lastName} type="textarea" name="lastName" id="lastName" />
                </Col>
              </FormGroup>
              <Button id="submit" type="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  }
}

SignUp.propTypes = {

}

SignUp.defaultProps = {

}

export default withAPI(SignUp)

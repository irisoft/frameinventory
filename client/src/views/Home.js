import React from 'react'
// import PropTypes from 'prop-types'
import { Container, Row, Col } from 'reactstrap'


function Home(props) {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="page-title">Home</h1>
        </Col>
      </Row>
    </Container>
  )
}

Home.propTypes = {

}

Home.defaultProps = {

}

export default Home

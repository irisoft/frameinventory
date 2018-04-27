import React from 'react'
import { Redirect } from 'react-router-dom'
// import PropTypes from 'prop-types'
// import { div, Row, Col } from 'reactstrap'
// import Container from '../components/Container'

function Home() {
  return (
    <Redirect to="/auth/" />
    // <Container>
    //   <div>
    //     <div>
    //       <h1 className="f3">Home</h1>
    //     </div>
    //   </div>
    // </Container>
  )
}

Home.propTypes = {

}

Home.defaultProps = {

}

export default Home

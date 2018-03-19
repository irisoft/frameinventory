import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Navbar, Nav, Button, ListGroup, Container, Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
import { withAuth } from '@okta/okta-react'
import InventoryListItem from '../../components/InventoryListItem'
import DataAdapter from '../../dataAdapters/JsonApi'

class ListInventories extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inventories: [],
      authenticated: null,
    }

    this.checkAuthentication = this.checkAuthentication.bind(this)
    this.checkAuthentication()
    this.dataAdapter = DataAdapter
  }

  async componentDidMount() {
    this.setState({ inventories: await this.dataAdapter.getAllInventories() })
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

  render() {
    const { inventories } = this.state
    const inventoriesItems = Array.isArray(inventories) && inventories.map((inventory) => {
      const {
        id,
        start_date: startDateRaw,
        under_count: underCountRaw,
        over_count: overCountRaw,
      } = inventory

      const overCount = parseInt(overCountRaw.toString(), 10)
      const underCount = parseInt(underCountRaw.toString(), 10)

      const startDate = new Date(Date.parse(startDateRaw)).toDateString()

      return (
        <InventoryListItem
          key={id}
          id={id}
          title={startDate}
          underCount={underCount}
          overCount={overCount}
        />
      )
    })

    if (this.state.authenticated === null) return null

    return (
      <Container>
        <Row>
          <Col>
            <h1>Inventory Reports</h1>
            <ListGroup>
              {inventoriesItems}
            </ListGroup>
          </Col>
        </Row>
        <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
          <Nav className="bottom-nav">
            <Link to="/auth/upload">
              <Button block color="success">
                <i className="fas fa-upload" />&nbsp; Upload New Report
              </Button>
            </Link>
          </Nav>
        </Navbar>
      </Container>
    )
  }
}

ListInventories.propTypes = {
  auth: PropTypes.shape({
    logout: PropTypes.func,
    login: PropTypes.func,
    isAuthenticated: PropTypes.func,
  }),
}

ListInventories.defaultProps = {
  auth: null,
}

export default withAuth(ListInventories)

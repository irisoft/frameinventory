import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import { Navbar, Nav, Button, ListGroup, Row, Col } from 'reactstrap'
// import { Link } from 'react-router-dom'
import Container from '../../components/Container'
import PageHeading from '../../components/PageHeading'
import PageFooter from '../../components/PageFooter'
import InventoryListItem from '../../components/InventoryListItem'
import RoundButton from '../../components/RoundButton'
import UploadIcon from '../../assets/upload-icon.png'

class ListInventories extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inventories: [],
    }
  }

  async componentDidMount() {
    const { api } = this.props
    this.setState({ inventories: await api.getAllInventories() })
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

      return (
        <InventoryListItem
          key={id}
          id={id}
          timestamp={startDateRaw}
          underCount={underCount}
          overCount={overCount}
        />
      )
    })

    if (this.state.authenticated === null) return null

    return (
      <Container>
        <RoundButton
          label="< Back"
          to="/auth/"
        />
        <div className="flex items-end mb3">
          <div className="flex-auto">
            <PageHeading>Inventory <br />Reports</PageHeading>
          </div>
          <div className="w-10-l w-20-m tracked ttu gray f6 tr">Styles</div>
          <div className="w-10-l w-20-m tracked ttu gray f6 tr">Frames</div>
        </div>

        <ul className="list pl0 mt0 mb7">
          {inventoriesItems}
        </ul>

        <PageFooter>
          <RoundButton to="/auth" color="isgreen" textColor="white" label="Upload New MIMs" icon={UploadIcon} />
        </PageFooter>

        {/* <ListGroup>

        </ListGroup>

        <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
          <Nav className="bottom-nav">
            <Link to="/auth/upload">
              <Button block color="success">
                <i className="fas fa-upload" />&nbsp; Upload New Report
              </Button>
            </Link>
          </Nav>
        </Navbar> */}
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
  api: PropTypes.shape({}),
}

ListInventories.defaultProps = {
  auth: null,
  api: null,
}

export default ListInventories

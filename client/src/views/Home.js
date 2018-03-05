import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Navbar, Nav, Button, ListGroup } from 'reactstrap'
import InventoryListItem from '../components/InventoryListItem'
import DataAdapter from '../dataAdapters/JsonApi'
import { Link } from 'react-router-dom'

class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inventories: [],
      ready: false
    }

    this.dataAdapter = new DataAdapter()
  }

  async componentDidMount() {
    this.setState({ inventories: await this.dataAdapter.getAllInventories() })
  }

  render() {
    const { inventories } = this.state
    const inventoriesItems = Array.isArray(inventories) && inventories.map((inventory) => {

      const {
        id,
        start_date,
        under_count,
        over_count
      } = inventory

      const overCount = parseInt(over_count.toString(), 10)
      const underCount = parseInt(under_count.toString(), 10)

      const startDate = new Date(Date.parse(start_date)).toDateString()

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
    return (
      <div>
        <ListGroup>
          {inventoriesItems}
        </ListGroup>
        <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
          <Nav className="bottom-nav">
            <Link to="/upload">
              <Button block color="success">
                <i className="fas fa-upload"></i>&nbsp; Upload New Report
              </Button>
            </Link>
          </Nav>
        </Navbar>
      </div>
    )
  }
}

Home.propTypes = {
  dataAdapter: PropTypes.object
}

Home.defaultProps = {
  dataAdapter: null
}

export default Home

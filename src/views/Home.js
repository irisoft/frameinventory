import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, ListGroup } from 'reactstrap'
import InventoryListItem from '../components/InventoryListItem'
import DataAdapter from '../dataAdapters/LocalIndexedDB'
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
    const inventoriesItems = inventories.map((inventory) => {
      const {
        id,
        startDate,
        underCount,
        overCount
      } = inventory
      return (
        <InventoryListItem
          key={id}
          id={id}
          title={startDate.toDateString()}
          underCount={underCount}
          overCount={overCount}
        />
      )
    })
    return (
      <div>
        <div className="padded">
          <Link to="/upload"><Button block color="primary">Start New</Button></Link>
        </div>
        <ListGroup>
          {inventoriesItems}
        </ListGroup>
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

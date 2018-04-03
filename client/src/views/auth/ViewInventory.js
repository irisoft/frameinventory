import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDataGrid from 'react-data-grid'
import { Link } from 'react-router-dom'
import Media from 'react-media'
// import { Navbar, Nav, Button, ButtonGroup } from 'reactstrap'

const FilterButton = ({
  active, size, children, filterValue, onClick, screenIsSmall,
}) => {
  const style = {}

  if (!screenIsSmall) {
    style.width = 120
  }

  return (null
  // <Button
  //   style={style}
  //   active={active}
  //   size={size}
  //   onClick={() => {
  //     if (typeof onClick === 'function') {
  //       onClick(filterValue)
  //     }
  //   }}
  // >
  //   {children}
  // </Button>
  )
}

FilterButton.propTypes = {
  active: PropTypes.bool,
  size: PropTypes.string,
  children: PropTypes.node,
  filterValue: PropTypes.string,
  onClick: PropTypes.func,
  screenIsSmall: PropTypes.bool,
}

FilterButton.defaultProps = {
  active: false,
  size: null,
  children: null,
  filterValue: null,
  onClick: null,
  screenIsSmall: true,
}

class ViewInventory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inventoryProductsAndCounts: [],
      filter: 'all',
      gridHeight: 1000,
    }

    this.fetchData = this.fetchData.bind(this)

    this.columns = (screenIsSmall) => {
      const columns = [
        {
          key: 'upc', name: 'UPC', width: 120, sortable: true,
        },
      ]

      if (!screenIsSmall) {
        columns.push({
          key: 'brand', name: 'Brand', width: 120, sortable: true,
        })
        columns.push({
          key: 'type', name: 'Type', width: 80, sortable: true,
        })
        columns.push({ key: 'description', name: 'Description', sortable: true })
      }

      columns.push({
        key: 'report_qty', name: 'Report Qty', sortable: true, width: 80, cellClass: 'text-right',
      })
      columns.push({
        key: 'manual_qty', name: 'Scan Qty', sortable: true, width: 80, cellClass: 'text-right', editable: true,
      })

      return columns
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps, prevState) {
    const { match: { params: { inventoryId: previousInventoryId } } } = prevProps
    const { match: { params: { inventoryId } } } = this.props
    const { filter: prevFilter } = prevState
    const { filter } = this.state
    if (inventoryId && (inventoryId !== previousInventoryId || filter !== prevFilter)) {
      this.fetchData()
    }
  }

  async fetchData() {
    const { api, match: { params: { inventoryId } } } = this.props
    const { filter } = this.state
    this.setState({
      inventoryProductsAndCounts: await api
        .getInventoryProductsAndCounts(parseInt(inventoryId.toString(), 10), filter),
    })
  }

  rowGetter = (i) => {
    const { inventoryProductsAndCounts } = this.state
    return inventoryProductsAndCounts[i]
  }

  handleGridSort = (sortColumn, sortDirection) => {
    const { inventoryProductsAndCounts } = this.state
    const comparer = (a, b) => {
      if (sortDirection === 'ASC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1
      } else if (sortDirection === 'DESC') {
        return (a[sortColumn] < b[sortColumn]) ? 1 : -1
      }
    }
    this.setState({ inventoryProductsAndCounts: inventoryProductsAndCounts.sort(comparer) })
  }

  handleGridRowsUpdated = async ({ fromRow, toRow, updated }) => {
    const inventoryProductsAndCounts = this.state.inventoryProductsAndCounts.slice()
    const updatedCopy = Object.assign({}, updated)
    const { api } = this.props

    if (typeof updatedCopy === 'object' && typeof updatedCopy.manual_qty === 'string') {
      updatedCopy.manual_qty = parseInt(updatedCopy.manual_qty, 10)
    }

    const promises = []
    for (let i = fromRow; i <= toRow; i += 1) {
      const { inventory_id: inventoryId, upc } = inventoryProductsAndCounts[i]
      promises.push(api.updateCount(upc, inventoryId, updatedCopy.manual_qty))
    }
    await Promise.all(promises)

    this.fetchData()
  }

  handleFilter = (filter) => {
    this.setState({ filter })
  }

  captureEl = (el) => {
    this.measureHeight(el)
    el.addEventListener('resize', () => {
      this.measureHeight(el)
    })
  }

  measureHeight = (el) => {
    if (el) {
      this.setState({ gridHeight: parseInt(el.offsetHeight.toString(), 10) - 43 - 54 })
    }
  }

  render() {
    const { inventoryProductsAndCounts, filter, gridHeight } = this.state
    const { match: { params: { inventoryId } } } = this.props
    return (
      <Media query="(max-width: 599px)">
        {screenIsSmall => (
          <div className="max-height" ref={this.measureHeight}>
            {/* <Navbar light color="inverse" className={`${screenIsSmall && 'justify-content-between'}`}>
              <Nav className="bottom-nav">
                { !screenIsSmall && <p style={{ color: 'white' }}>Filter:</p> }
                <ButtonGroup>
                  <FilterButton screenIsSmall={screenIsSmall} color="secondary" size="sm" active={filter === 'all'} onClick={this.handleFilter} filterValue="all">All</FilterButton>
                  <FilterButton screenIsSmall={screenIsSmall} color="warning" size="sm" active={filter === 'over'} onClick={this.handleFilter} filterValue="over">Over</FilterButton>
                  <FilterButton screenIsSmall={screenIsSmall} color="danger" size="sm" active={filter === 'under'} onClick={this.handleFilter} filterValue="under">Under</FilterButton>
                  <FilterButton screenIsSmall={screenIsSmall} color="success" size="sm" active={filter === 'even'} onClick={this.handleFilter} filterValue="even">Even</FilterButton>
                </ButtonGroup>
              </Nav>
            </Navbar> */}
            {(Array.isArray(inventoryProductsAndCounts) && inventoryProductsAndCounts.length > 0) &&
              <ReactDataGrid
                columns={this.columns(screenIsSmall)}
                rowGetter={this.rowGetter}
                rowsCount={inventoryProductsAndCounts.length}
                minHeight={gridHeight}
                onGridSort={this.handleGridSort}
                enableCellSelect
                onGridRowsUpdated={this.handleGridRowsUpdated}
              />
            }

            {/* <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
              <Nav className="bottom-nav">
                <Link to="/auth">
                  <Button color="secondary" size="md"><i className="fas fa-home" /> Home</Button>
                </Link>
                <Link to={`/auth/scan/${inventoryId}`}>
                  <Button color="primary" size="md"><i className="fas fa-barcode" /> Scan</Button>
                </Link>
                <Link to="/auth">
                  <Button color="success" size="md"><i className="fas fa-check-square" /> Done</Button>
                </Link>
              </Nav>
            </Navbar> */}
          </div>
        )}
      </Media>
    )
  }
}

ViewInventory.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      inventoryId: PropTypes.string,
    }),
  }),
}

ViewInventory.defaultProps = {
  match: null,
}

export default ViewInventory

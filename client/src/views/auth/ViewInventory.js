import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDataGrid, { Row } from 'react-data-grid'
import { Link } from 'react-router-dom'
import Media from 'react-media'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import UploadIcon from '../../assets/upload-icon.png'

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

class RowRenderer extends React.Component {
  static propTypes = {
    idx: PropTypes.string.isRequired,
  };

  setScrollLeft = (scrollBy) => {
    // if you want freeze columns to work, you need to make sure you implement this as apass through
    this.row.setScrollLeft(scrollBy)
  };

  getRowStyle = () => ({
    color: this.getRowBackground(),
    '> div': {
      backgrounColor: this.getRowBackground(),
    },
  });

  getRowBackground = () => (this.props.idx % 2 ? 'green' : 'blue');

  getClassName = () => {
    const { report_qty, manual_qty } = this.props.row
    const oddRow = this.props.idx % 2
    console.log('row props', this.props)
    if (report_qty === manual_qty) return `even-row ${oddRow && 'odd-row'} near-black`
    if (report_qty > manual_qty) return `under-row ${oddRow && 'odd-row'} near-black`
    if (report_qty < manual_qty) return `over-row ${oddRow && 'odd-row'} near-black`
  }

  render() {
    // here we are just changing the style
    // but we could replace this with anything we liked, cards, images, etc
    // usually though it will just be a matter of wrapping a div, and then calling back through to the grid
    return (<div className={this.getClassName()}><Row ref={node => this.row = node} {...this.props} /></div>)
  }
}

class PercentCompleteFormatter extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
  };

  render() {
    const percentComplete = `${this.props.value}%`
    console.log('p', this.props)
    return (
      <div className="progress" style={{ marginTop: '20px' }}>
        <div className="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{ width: percentComplete }}>
          {percentComplete}
        </div>
      </div>)
  }
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
          key: 'upc', name: 'UPC', width: 160, sortable: true,
        }, {
          key: 'brand', name: 'Brand', width: 180, sortable: true,
        }, {
          key: 'type', name: 'Type', width: 120, sortable: true,
        }, {
          key: 'description', name: 'Description', sortable: true,
        }, {
          key: 'report_qty', name: 'MIMs Qty', sortable: true, width: 90, cellClass: 'tr',
        }, {
          key: 'manual_qty', name: 'Scan Qty', sortable: true, width: 90, cellClass: 'tr', editable: true,
        },
      ]

      if (!screenIsSmall) {
        columns.push()
        columns.push()
        columns.push()
      }

      columns.push()
      columns.push()

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
      <Container wide>
        <div className="flex items-center mb4">
          <div className="mr3 mv0">
            <RoundButton
              label="< Reports"
              to="/auth/list"
            />
          </div>
          <h1 className="f2 normal mr3 mv0">Inventory Report</h1>
          <h2 className="f5 normal flex-auto mb0 mt2">Someday, Some 1</h2>
          <RoundButton to={`/auth/scan/${inventoryId}`} color="isgreen" textColor="white" label="Scan" icon={UploadIcon} />
        </div>

        <div className="flex items-center mb4">
          <div className="bg-light-gray br2 pa3">
            <div className="fl w-50 pa2 gray f6">
              Styles (UPCs)
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $50
            </div>
            <div className="fl w-50 pa2 gray f6">
              Frames
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $500
            </div>
            <div className="fl w-50 pa2 gray f6">
              Value
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $500
            </div>
          </div>
          <div className="bold black">&nbsp;-&nbsp;</div>
          <div className="bg-light-gray br2 pa3">
            <div className="fl w-50 pa2 gray f6">
              Styles (UPCs)
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $50
            </div>
            <div className="fl w-50 pa2 gray f6">
              Frames
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $500
            </div>
            <div className="fl w-50 pa2 gray f6">
              Value
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $500
            </div>
          </div>
          <div>&nbsp;=&nbsp;</div>
          <div className="bg-light-gray br2 pa3">
            <div className="fl w-50 pa2 gray f6">
              Styles (UPCs)
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $50
            </div>
            <div className="fl w-50 pa2 gray f6">
              Frames
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $500
            </div>
            <div className="fl w-50 pa2 gray f6">
              Value
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              $500
            </div>
          </div>
        </div>

        <div className="max-height" ref={this.measureHeight}>
          {(Array.isArray(inventoryProductsAndCounts) && inventoryProductsAndCounts.length > 0) &&
            <ReactDataGrid
              columns={this.columns(false)}
              rowGetter={this.rowGetter}
              rowsCount={inventoryProductsAndCounts.length}
              minHeight={1000}
              onGridSort={this.handleGridSort}
              enableCellSelect
              onGridRowsUpdated={this.handleGridRowsUpdated}
              rowRenderer={RowRenderer}
              rowHeight={80}
            />
          }
        </div>
      </Container>
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

/*
<Navbar light color="inverse" className={`${screenIsSmall && 'justify-content-between'}`}>
  <Nav className="bottom-nav">
  { !screenIsSmall && <p style={{ color: 'white' }}>Filter:</p> }
  <ButtonGroup>
  <FilterButton screenIsSmall={screenIsSmall} color="secondary" size="sm" active={filter === 'all'} onClick={this.handleFilter} filterValue="all">All</FilterButton>
  <FilterButton screenIsSmall={screenIsSmall} color="warning" size="sm" active={filter === 'over'} onClick={this.handleFilter} filterValue="over">Over</FilterButton>
  <FilterButton screenIsSmall={screenIsSmall} color="danger" size="sm" active={filter === 'under'} onClick={this.handleFilter} filterValue="under">Under</FilterButton>
  <FilterButton screenIsSmall={screenIsSmall} color="success" size="sm" active={filter === 'even'} onClick={this.handleFilter} filterValue="even">Even</FilterButton>
  </ButtonGroup>
  </Nav>
</Navbar>
*/

/*
<Navbar light color="inverse" fixed="bottom" className="justify-content-between">
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
</Navbar>
*/

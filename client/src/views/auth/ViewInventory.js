/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import ReactDataGrid, { Row } from 'react-data-grid'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import UploadIcon from '../../assets/upload-icon.png'
import OverArrow from '../../components/OverArrow'
import UnderArrow from '../../components/UnderArrow'
import EqualIcon from '../../components/EqualIcon'

class RowRenderer extends React.Component {
  static propTypes = {
    idx: PropTypes.string.isRequired,
  };

  setScrollLeft = (scrollBy) => {
    // if you want freeze columns to work, you need to make sure you
    // implement this as a pass-through
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
    const { report_qty: reportQty, manual_qty: manualQty } = this.props.row
    const oddRow = this.props.idx % 2
    if (reportQty === manualQty) return `even-row ${oddRow && 'odd-row'} near-black`
    if (reportQty > manualQty) return `under-row ${oddRow && 'odd-row'} near-black`
    if (reportQty < manualQty) return `over-row ${oddRow && 'odd-row'} near-black`
  }

  render() {
    // here we are just changing the style
    // but we could replace this with anything we liked, cards, images, etc
    // usually though it will just be a matter of wrapping a div, and then
    // calling back through to the grid
    return (
      <div className={this.getClassName()}>
        <Row ref={(node) => { this.row = node }} {...this.props} />
      </div>
    )
  }
}

RowRenderer.propTypes = {
  row: PropTypes.shape({
    report_qty: PropTypes.number,
    manual_qty: PropTypes.number,
  }).isRequired,
}


function PercentCompleteFormatter({ value }) {
  return (
    <div className="tc" style={{ }}>
      { value === 0 && <EqualIcon />}
      { value < 0 && <OverArrow />}
      { value > 0 && <UnderArrow />}
    </div>
  )
}

PercentCompleteFormatter.propTypes = {
  value: PropTypes.number.isRequired,
}


class ViewInventory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inventoryProductsAndCounts: [],
      inventorySummary: [{}],
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
        }, {
          key: 'over_under', formatter: PercentCompleteFormatter, name: '', sortable: true, width: 90, cellClass: 'status-indicator',
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

  componentDidUpdate(prevProps) {
    const { match: { params: { inventoryId: previousInventoryId } } } = prevProps
    const { match: { params: { inventoryId } } } = this.props
    if (inventoryId && (inventoryId !== previousInventoryId)) {
      this.fetchData()
    }
  }

  async fetchData() {
    const { api, match: { params: { inventoryId } } } = this.props
    this.setState({
      inventoryProductsAndCounts: await api
        .getInventoryProductsAndCounts(parseInt(inventoryId.toString(), 10)),
      inventorySummary: await api
        .getInventorySummary(parseInt(inventoryId.toString(), 10)),
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

  render() {
    const {
      inventoryProductsAndCounts,
      inventorySummary,
    } = this.state
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
          <h2 className="f5 normal flex-auto mb0 mt2">{new Moment(inventorySummary[0].start_date).format('dddd, MMMM Do')}</h2>
          <RoundButton to={`/auth/scan/${inventoryId}`} color="isgreen" textColor="white" label="Scan" icon={UploadIcon} />
        </div>

        <div className="flex items-center mb4">
          <div className="bg-light-gray br2 pa3">
            <div className="fl w-50 pa2 gray f6">
              Styles (UPCs)
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].report_style_count}
            </div>
            <div className="fl w-50 pa2 gray f6">
              Frames
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].report_frame_count}
            </div>
            <div className="fl w-50 pa2 gray f6">
              Value
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].report_value}
            </div>
          </div>
          <div className="bold black">&nbsp;-&nbsp;</div>
          <div className="bg-light-gray br2 pa3">
            <div className="fl w-50 pa2 gray f6">
              Styles (UPCs)
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].manual_style_count}
            </div>
            <div className="fl w-50 pa2 gray f6">
              Frames
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].manual_frame_count}
            </div>
            <div className="fl w-50 pa2 gray f6">
              Value
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].manual_value}
            </div>
          </div>
          <div>&nbsp;=&nbsp;</div>
          <div className="bg-light-gray br2 pa3">
            <div className="fl w-50 pa2 gray f6">
              Styles (UPCs)
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].style_diff}
            </div>
            <div className="fl w-50 pa2 gray f6">
              Frames
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].frame_diff}
            </div>
            <div className="fl w-50 pa2 gray f6">
              Value
            </div>
            <div className="fl w-50 pa2 tr near-black f5">
              {inventorySummary[0].value_diff}
            </div>
          </div>
        </div>

        <div className="max-height" style={{ marginRight: -90 }}>
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

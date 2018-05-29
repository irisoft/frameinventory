/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import ReactDataGrid, { Row } from 'react-data-grid'
import Spinner from 'react-spinkit'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import UploadIcon from '../../assets/upload-icon.png'
import OverArrow from '../../components/OverArrow'
import UnderArrow from '../../components/UnderArrow'
import EqualIcon from '../../components/EqualIcon'
import CopyDialog from '../../components/CopyDialog'

function isArrayValid(a) {
  return Array.isArray(a) && a.length > 0
}

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
    const { report_qty: reportQty, scannedQty } = this.props.row
    const oddRow = this.props.idx % 2
    if (reportQty === scannedQty) return `even-row ${oddRow && 'odd-row'} near-black`
    if (reportQty > scannedQty) return `under-row ${oddRow && 'odd-row'} near-black`
    if (reportQty < scannedQty) return `over-row ${oddRow && 'odd-row'} near-black`
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
    scannedQty: PropTypes.number,
  }).isRequired,
}


function PercentCompleteFormatter({ value }) {
  return (
    <div className="tc" style={{ }}>
      { value === 0 && <EqualIcon />}
      { value > 0 && <OverArrow />}
      { value < 0 && <UnderArrow />}
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
      dialogInventoryStyleDiffOpen: false,
      FramesOverDialogOpen: false,
      FramesUnderDialogOpen: false,
      reportIsReady: false,
      readyToTransition: false,
    }

    this.fetchData = this.fetchData.bind(this)

    this.columns = () => {
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
          key: 'scannedQty', name: 'Scan Qty', sortable: true, width: 90, cellClass: 'tr', editable: true,
        }, {
          key: 'over_under', formatter: PercentCompleteFormatter, name: '', sortable: true, width: 90, cellClass: 'status-indicator',
        },
      ]

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

    const {
      inventoryProductsAndCounts,
      inventorySummary,
      readyToTransition,
    } = this.state

    if (!readyToTransition) {
      const ready = isArrayValid(inventoryProductsAndCounts) && isArrayValid(inventorySummary)
      if (ready) {
        this.setState({ readyToTransition: true })
        setTimeout(() => {
          this.setState({ reportIsReady: true })
        }, 1000)
      }
    }
  }

  async fetchData() {
    const { api, match: { params: { inventoryId } } } = this.props
    this.setState({
      inventoryProductsAndCounts: await api
        .getInventoryProductsAndCounts(inventoryId),
      inventorySummary: await api
        .getInventorySummary(inventoryId),
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

    if (typeof updatedCopy === 'object' && typeof updatedCopy.scannedQty === 'string') {
      updatedCopy.scannedQty = parseInt(updatedCopy.scannedQty, 10)
    }

    const promises = []
    for (let i = fromRow; i <= toRow; i += 1) {
      const { inventory_id: inventoryId, upc } = inventoryProductsAndCounts[i]
      promises.push(api.updateCount(upc, inventoryId, updatedCopy.scannedQty))
    }
    await Promise.all(promises)

    this.fetchData()
  }

  render() {
    const {
      inventoryProductsAndCounts,
      inventorySummary,
      FramesOverDialogOpen,
      FramesUnderDialogOpen,
      dialogInventoryStyleDiffOpen,
      readyToTransition,
      reportIsReady,
    } = this.state

    const {
      match: {
        params: {
          inventoryId,
        },
      },
      api,
    } = this.props

    let pageContents

    if (!reportIsReady) {
      pageContents = (
        <section className={`mv3 fade-in ${readyToTransition && 'fade-out'}`}>
          <div className="dropzone">
            <div className="flex items-center justify-center bg-moon-gray w-100 ba b--dashed b--light-silver flex pa5 br2 bw1">
              <div>
                <div className="flex items-center space-between near-black lc">
                  <Spinner name="cube-grid" color="black" fadeIn="none" />
                  <span className="pl3">Building your report...</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    } else {
      pageContents = (
        <div className="fade-in">
          <div className="flex mb4">
            <div className="bg-light-gray br2 pa3 w-third">
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Styles (UPCs)</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventorySummary[0].scan_style_count}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Frames</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventorySummary[0].scan_frame_count}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Value</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventorySummary[0].scan_value}</span>
                </div>
              </div>
            </div>
            <div className="bold black flex items-center">&nbsp;-&nbsp;</div>
            <div className="bg-light-gray br2 pa3 w-third">
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Styles (UPCs)</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventorySummary[0].report_style_count}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Frames</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventorySummary[0].report_frame_count}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Value</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventorySummary[0].report_value}</span>
                </div>
              </div>
            </div>
            <div className="bold black flex items-center">&nbsp;=&nbsp;</div>
            <div className="bg-light-gray br2 pa3 w-third">
              <div className="fl w-100 pa2">
                <button className="pv2 gray f5 bn bg-near-white br-pill ph4 pointer dim outline-0" onClick={() => { this.setState({ dialogInventoryStyleDiffOpen: true }) }}>
                  { inventorySummary[0].style_diff > 0 ? <OverArrow /> : <UnderArrow /> }&nbsp;
                  {Math.abs(inventorySummary[0].style_diff)} Styles { inventorySummary[0].style_diff > 0 ? 'More' : 'Less' }
                </button>
              </div>
              <div className="fl w-100 pa2">
                <button
                  className="pv2 gray f5 bn bg-near-white br-pill br--left ph4 pointer dim outline-0 w-50"
                  onClick={() => { this.setState({ FramesOverDialogOpen: true }) }}
                  title={`${inventorySummary[0].styles_over} styles with more frames than MIMs`}
                >
                  <OverArrow />&nbsp;
                  {inventorySummary[0].styles_over}
                </button>

                <button
                  className="pv2 gray f5 bn bg-near-white br-pill br--right ph4 pointer dim outline-0 w-50"
                  onClick={() => { this.setState({ FramesUnderDialogOpen: true }) }}
                  title={`${inventorySummary[0].styles_under} styles with fewer frames than MIMs`}
                >
                  <UnderArrow />&nbsp;
                  {inventorySummary[0].styles_under}
                </button>
              </div>
              <div className="fl w-100 pa2 gray f6">
                <span className="pa2 dib">Difference in value: <span className="f5 near-black">{inventorySummary[0].value_diff}</span></span>
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

          <CopyDialog
            isOpen={dialogInventoryStyleDiffOpen}
            onClose={() => { this.setState({ dialogInventoryStyleDiffOpen: false }) }}
            status={inventorySummary[0].style_diff > 0 ? 'over' : 'under'}
            fetchData={async () => {
              const data = await api.getInventoryStylesDiff(inventoryId)
              return data
            }}
            name="StyleDiffDialog"
            title={`${Math.abs(inventorySummary[0].style_diff)} ${(inventorySummary[0].style_diff > 0) ? 'more styles than MIMs' : 'less styles than MIMs'}`}
          />

          <CopyDialog
            isOpen={FramesOverDialogOpen}
            onClose={() => { this.setState({ FramesOverDialogOpen: false }) }}
            status="over"
            fetchData={async () => {
              const { over } = await api.getInventoryFramesDiff(inventoryId)
              return over
            }}
            name="FramesOverDialog"
            title={`${inventorySummary[0].styles_over} styles with more frames than MIMs`}
          />

          <CopyDialog
            isOpen={FramesUnderDialogOpen}
            onClose={() => { this.setState({ FramesUnderDialogOpen: false }) }}
            status="under"
            fetchData={async () => {
              const { under } = await api.getInventoryFramesDiff(inventoryId)
              return under
            }}
            name="FramesUnderDialog"
            title={`${inventorySummary[0].styles_under} styles with fewer frames than MIMs`}
          />
        </div>
      )
    }

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
          {/* <h2 className="f5 normal flex-auto mb0 mt2">{new Moment(inventorySummary[0].start_date).format('dddd, MMMM Do')}</h2> */}
          <RoundButton to={`/auth/scan/${inventoryId}`} color="isgreen" textColor="white" label="Scan" icon={UploadIcon} />
        </div>
        {pageContents}
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
  api: PropTypes.shape({

  }),
}

ViewInventory.defaultProps = {
  match: null,
  api: null,
}

export default ViewInventory

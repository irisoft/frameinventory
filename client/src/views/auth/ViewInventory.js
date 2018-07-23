/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import ReactDataGrid, { Row } from 'react-data-grid'
import Spinner from 'react-spinkit'
import Inventory from '../../dao/Inventory'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import UploadIcon from '../../assets/upload-icon.png'
import OverArrow from '../../components/OverArrow'
import UnderArrow from '../../components/UnderArrow'
import EqualIcon from '../../components/EqualIcon'
import CopyDialog from '../../components/CopyDialog'
import EditableLabel from '../../components/EditableLabel'
import withFirebase from '../../hocs/withFirebase'

function isArrayValid(a) {
  return Array.isArray(a) && a.length > 0
}

class RowRenderer extends React.Component {
  static propTypes = {
    idx: PropTypes.string.isRequired,
  };

  setScrollLeft = (scrollBy) => {
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
    const { mimsQty, fifoQty } = this.props.row
    const oddRow = this.props.idx % 2
    if (mimsQty === fifoQty) return `even-row ${oddRow && 'odd-row'} near-black`
    if (mimsQty > fifoQty) return `under-row ${oddRow && 'odd-row'} near-black`
    if (mimsQty < fifoQty) return `over-row ${oddRow && 'odd-row'} near-black`
  }

  render() {
    return (
      <div className={this.getClassName()}>
        <Row ref={(node) => { this.row = node }} {...this.props} />
      </div>
    )
  }
}

RowRenderer.propTypes = {
  row: PropTypes.shape({
    mimsQty: PropTypes.number,
    fifoQty: PropTypes.number,
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
      inventoryItems: [],
      dialogInventoryStyleDiffOpen: false,
      FramesOverDialogOpen: false,
      FramesUnderDialogOpen: false,
      readyToTransition: false,
      report: null,
      inventory: null,
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
          key: 'mimsQty', name: 'MIMs Qty', sortable: true, width: 90, cellClass: 'tr',
        }, {
          key: 'fifoQty', name: 'Scan Qty', sortable: true, width: 90, cellClass: 'tr', editable: true,
        }, {
          key: 'overUnder', formatter: PercentCompleteFormatter, name: '', sortable: true, width: 90, cellClass: 'status-indicator',
        },
      ]

      return columns
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps) {
    /* eslint-disable react/no-did-update-set-state */

    const { match: { params: { inventoryId: previousInventoryId } } } = prevProps
    const { match: { params: { inventoryId } } } = this.props
    if (inventoryId && (inventoryId !== previousInventoryId)) {
      this.fetchData()
    }

    const {
      inventoryItems,
      readyToTransition,
    } = this.state

    if (!readyToTransition) {
      const ready = isArrayValid(inventoryItems)
      if (ready) {
        this.setState({ readyToTransition: true })
      }
    }
  }

  async fetchData() {
    const { match: { params: { inventoryId } }, userProfile } = this.props
    const inventory = await Inventory.load(userProfile.organizationId, inventoryId)
    this.setState({
      inventory,
      inventoryItems: await inventory.getItems(),
    })
    inventory.registerReportWatcher((report) => {
      this.setState({
        report,
      })
    }, true)
  }

  rowGetter = (i) => {
    const { inventoryItems } = this.state
    return inventoryItems[i]
  }

  handleGridSort = (sortColumn, sortDirection) => {
    const { inventoryItems } = this.state
    const comparer = (a, b) => {
      if (sortDirection === 'ASC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1
      } else if (sortDirection === 'DESC') {
        return (a[sortColumn] < b[sortColumn]) ? 1 : -1
      }
    }
    this.setState({ inventoryItems: inventoryItems.sort(comparer) })
  }

  // handleGridRowsUpdated = async ({ fromRow, toRow, updated }) => {
  //   const inventoryItems = this.state.inventoryItems.slice()
  //   const updatedCopy = Object.assign({}, updated)
  //   const { api } = this.props
  //
  //   if (typeof updatedCopy === 'object' && typeof updatedCopy.fifoQty === 'string') {
  //     updatedCopy.fifoQty = parseInt(updatedCopy.fifoQty, 10)
  //   }
  //
  //   const promises = []
  //   for (let i = fromRow; i <= toRow; i += 1) {
  //     const { inventory_id: inventoryId, upc } = inventoryItems[i]
  //     promises.push(api.updateCount(upc, inventoryId, updatedCopy.fifoQty))
  //   }
  //   await Promise.all(promises)
  //
  //   this.fetchData()
  // }

  render() {
    const {
      inventoryItems,
      FramesOverDialogOpen,
      FramesUnderDialogOpen,
      dialogInventoryStyleDiffOpen,
      readyToTransition,
      inventory,
      report,
    } = this.state

    const {
      match: {
        params: {
          inventoryId,
        },
      },
    } = this.props

    let pageContents
    const readyToRoll = (inventory && typeof inventory === 'object' && 'report' in inventory && report && typeof report === 'object' && 'counts' in report)
    if (!readyToRoll /*! reportIsReady */) {
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
                  <span className="pa2 dib">{inventory.report.fifo.styles}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Frames</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventory.report.fifo.frames}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Value</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">${inventory.report.fifo.value.toFixed(2)}</span>
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
                  <span className="pa2 dib">{inventory.report.mims.styles}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Frames</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">{inventory.report.mims.frames}</span>
                </div>
              </div>
              <div className="cf">
                <div className="fl w-50 pa2 gray f6">
                  <span className="pa2 dib">Value</span>
                </div>
                <div className="fl w-50 pa2 tr near-black f5">
                  <span className="pa2 dib">${inventory.report.mims.value.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="bold black flex items-center">&nbsp;=&nbsp;</div>
            <div className="bg-light-gray br2 pa3 w-third">
              <div className="fl w-100 pa2">
                <button className="pv2 gray f5 bn bg-near-white br-pill ph4 pointer dim outline-0" onClick={() => { this.setState({ dialogInventoryStyleDiffOpen: true }) }}>
                  { inventory.report.diff.styles > 0 ? <OverArrow /> : <UnderArrow /> }&nbsp;
                  {Math.abs(inventory.report.diff.styles)} Styles { inventory.report.diff.styles > 0 ? 'More' : 'Less' }
                </button>
              </div>
              <div className="fl w-100 pa2">
                <button
                  className="pv2 gray f5 bn bg-near-white br-pill br--left ph4 pointer dim outline-0 w-50"
                  onClick={() => { this.setState({ FramesOverDialogOpen: true }) }}
                  title={`${inventory.report.counts.over} styles with more frames than MIMs`}
                >
                  <OverArrow />&nbsp;
                  {inventory.report.counts.over}
                </button>

                <button
                  className="pv2 gray f5 bn bg-near-white br-pill br--right ph4 pointer dim outline-0 w-50"
                  onClick={() => { this.setState({ FramesUnderDialogOpen: true }) }}
                  title={`${inventory.report.counts.under} styles with fewer frames than MIMs`}
                >
                  <UnderArrow />&nbsp;
                  {inventory.report.counts.under}
                </button>
              </div>
              <div className="fl w-100 pa2 gray f6">
                <span className="pa2 dib">Difference in value: <span className="f5 near-black">${inventory.report.diff.value.toFixed(2)}</span></span>
              </div>
            </div>
          </div>

          <div className="max-height" style={{ marginRight: -90 }}>
            {(Array.isArray(inventoryItems) && inventoryItems.length > 0) &&
              <ReactDataGrid
                columns={this.columns(false)}
                rowGetter={this.rowGetter}
                rowsCount={inventoryItems.length}
                minHeight={1000}
                onGridSort={this.handleGridSort}
                enableCellSelect
                rowRenderer={RowRenderer}
                rowHeight={80}
              />
            }
          </div>

          <CopyDialog
            isOpen={dialogInventoryStyleDiffOpen}
            onClose={() => { this.setState({ dialogInventoryStyleDiffOpen: false }) }}
            status={inventory.report.diff.styles > 0 ? 'over' : 'under'}
            fetchData={async () => inventory.getStylesDiff()}
            name="StyleDiffDialog"
            showQty={false}
            title={`${Math.abs(inventory.report.diff.styles)} ${(inventory.report.diff.styles > 0) ? 'more styles than MIMs' : 'less styles than MIMs'}`}
          />

          <CopyDialog
            isOpen={FramesOverDialogOpen}
            onClose={() => { this.setState({ FramesOverDialogOpen: false }) }}
            status="over"
            fetchData={async () => inventory.getOver()}
            name="FramesOverDialog"
            title={`${inventory.report.counts.over} styles with more frames than MIMs`}
          />

          <CopyDialog
            isOpen={FramesUnderDialogOpen}
            onClose={() => { this.setState({ FramesUnderDialogOpen: false }) }}
            status="under"
            fetchData={async () => inventory.getUnder()}
            name="FramesUnderDialog"
            title={`${inventory.report.counts.under} styles with fewer frames than MIMs`}
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
          <h1 className="f2 normal mr3 mv0"><EditableLabel model={inventory} prop="name" defaultLabel="Inventory Report" /> </h1>
          <h2 className="f5 normal flex-auto mb0 mt2">{readyToRoll ? new Moment(inventory.startedAt).format('dddd, MMMM Do') : ''}</h2>
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
}

ViewInventory.defaultProps = {
  match: null,
}

export default withFirebase(ViewInventory)

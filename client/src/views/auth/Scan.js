/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import firebase from 'firebase/app'
import ReactDataGrid, { Row } from 'react-data-grid'
import Scanner from '../../components/Scanner'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import BeepFail from '../../assets/beep-fail.mp3'
import BeepSuccess from '../../assets/beep-success.mp3'
import ScanLog from '../../dao/ScanLog'
import InventoryCount from '../../dao/InventoryCount'
import withFirebase from '../../hocs/withFirebase'
import TrashIcon from '../../assets/trash.svg'

const { Toolbar } = require('react-data-grid-addons')

const getFirestoreTimestamp = firebase.firestore.Timestamp.now

function RowAction({ dependentValues: scanLogItem }) {
  return (
    <div className="tc">
      <img
        alt="delete"
        role="button"
        tabIndex={0}
        src={TrashIcon}
        width={18}
        height={15}
        className="pa1 pointer dim grow"
        onClick={() => {
          if (scanLogItem && typeof scanLogItem.delete === 'function') {
            scanLogItem.delete()
          }
        }}
        onKeyDown={() => {}}
      />
    </div>
  )
}

function TimestampFormatter({ value }) {
  return (
    <div className="tc">
      {Moment(value).fromNow()}
    </div>
  )
}

class RowRenderer extends React.Component {
  getClassName = () => (this.props.idx % 2 ? 'even-row odd-row' : 'even-row')

  render() {
    return (
      <div className={this.getClassName()}>
        <Row ref={(node) => { this.row = node }} {...this.props} />
      </div>
    )
  }
}

class Scan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scanLog: [],
      inventoryCount: null,
    }

    this.columns = () => {
      const columns = [
        {
          key: 'scannedAt', formatter: TimestampFormatter, name: 'Time', width: 180, sortable: true,
        }, {
          key: 'upc', name: 'UPC', width: 180, sortable: true, filterable: true,
        },
      ]

      return columns
    }
  }

  async componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */

    const {
      match: {
        params: {
          inventoryId,
        },
      },
      userProfile,
    } = this.props

    const stopWatching = await ScanLog
      .loadCollection(
        userProfile.organizationId,
        inventoryId,
        [],
        { fieldPath: 'scannedAt', directionStr: 'desc' },
        (scanLog) => {
          this.setState({ scanLog, originalScanLog: scanLog })
        },
      )

    this.setState({ stopWatching })
  }

  componentWillUnmount() {
    const { stopWatching, stopWatchingLastItem } = this.state
    if (typeof stopWatching === 'function') stopWatching()
    if (typeof stopWatchingLastItem === 'function') stopWatchingLastItem()
  }

  rowGetter = (i) => {
    const { scanLog } = this.state
    return scanLog[i]
  }

  handleGridSort = (sortColumn, sortDirection) => {
    const { scanLog } = this.state
    const comparer = (a, b) => {
      if (sortDirection === 'ASC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1
      } else if (sortDirection === 'DESC') {
        return (a[sortColumn] < b[sortColumn]) ? 1 : -1
      }
    }
    this.setState({ scanLog: scanLog.sort(comparer) })
  }

  handleFilterChange = (filter) => {
    const { filters: newFilters, originalScanLog } = this.state

    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter
    } else {
      delete newFilters[filter.column.key]
    }

    const scanLog = originalScanLog.filter((scanLogItem) => {
      let isMatch = true
      for (const filterColumn in newFilters) {
        isMatch = (isMatch && scanLogItem[filterColumn] === newFilters[filterColumn])
      }
      return isMatch
    })

    this.setState({ filters: newFilters, scanLog })
  }

  onClearFilters = () => {
    const { originalScanLog } = this.state
    this.setState({ filters: {}, scanLog: originalScanLog })
  }

  handleDetected = async (upc, makeReadyForTheNextOne) => {
    if ([null, undefined, ''].indexOf(upc) !== -1) {
      makeReadyForTheNextOne()
      this.beepFail.play()
      return
    }

    const {
      match: {
        params: {
          inventoryId,
        },
      },
      userProfile,
    } = this.props

    const scanLog = new ScanLog({
      upc,
      scannedAt: getFirestoreTimestamp(),
    }, userProfile.organizationId, inventoryId)

    await scanLog.save().then(async (scanLogRef) => {
      scanLog.scanId = scanLogRef.id
      this.beepSuccess.play()
      makeReadyForTheNextOne()

      const stopWatchingLastItem = await InventoryCount.load(
        userProfile.organizationId,
        inventoryId,
        scanLog.upc,
        (updatedInventoryCount) => {
          this.setState({ inventoryCount: updatedInventoryCount, lastScan: scanLog })
        },
      )

      this.setState({ stopWatchingLastItem })
    })
  }

  handleDeleteLastScan = async () => {
    const { lastScan, stopWatchingLastItem } = this.state

    if (typeof stopWatchingLastItem === 'function') {
      stopWatchingLastItem()
    }

    await lastScan.delete()
    this.setState({
      lastScan: null,
      inventoryCount: null,
    })
  }

  handleActivate = () => {
    const { stopWatchingLastItem } = this.state

    if (typeof stopWatchingLastItem === 'function') {
      stopWatchingLastItem()
    }

    this.setState({
      lastScan: null,
      inventoryCount: null,
    })
  }

  render() {
    const {
      match: {
        params: {
          inventoryId,
        },
      },
    } = this.props

    const {
      scanLog,
      inventoryCount,
    } = this.state

    /* eslint-disable jsx-a11y/media-has-caption */
    return (
      <Container wide>
        <div className="flex items-center mb4">
          <div className="mr3 mv0 w-auto">
            <RoundButton
              label={<nobr>&larr; Back</nobr>}
              to={`/auth/inventory/${inventoryId}`}
            />
          </div>
          <div className="w-100">
            <h1 className="f2 normal mr3 mv0">Scan Log</h1>
          </div>
          <Scanner onDetected={this.handleDetected} onActivate={this.handleActivate}>
            <div className="br3 bg-light-gray silver pa3" style={{ width: 400 }}>
              <div className="cf mb2">
                <div className="w-40 fl">
                  <span className="tracked ttu">UPC</span>
                </div>
                <div className="w-20 fl tc">
                  <span className="tracked ttu">MIMs</span>
                </div>
                <div className="w-20 fl tc">
                  <span className="tracked ttu">FIFO</span>
                </div>
                <div className="w-20 fl tc">
                  <span className="tracked ttu">Delete</span>
                </div>
              </div>
              <div className="cf">
                <div className="w-40 fl">
                  <span className="near-black pa1">{inventoryCount ? inventoryCount.upc : '-'}</span>
                </div>
                <div className="w-20 fl tc">
                  <span className="near-black pa1">{inventoryCount ? inventoryCount.mimsQty : '-'}</span>
                </div>
                <div className="w-20 fl tc">
                  <span className="near-black pa1">{inventoryCount ? inventoryCount.fifoQty : '-'}</span>
                </div>
                <div className="w-20 fl tc">
                  {inventoryCount ? (
                    <img
                      role="button"
                      tabIndex={0}
                      src={TrashIcon}
                      width={18}
                      height={15}
                      className="pa1 pointer dim grow"
                      onClick={this.handleDeleteLastScan}
                    />
                  ) : '-'}
                </div>
              </div>
            </div>
          </Scanner>
        </div>

        <div className="padded">
          <div className="max-height">
            {(Array.isArray(scanLog) && scanLog.length > 0) &&
              <ReactDataGrid
                columns={this.columns(false)}
                rowGetter={this.rowGetter}
                rowsCount={scanLog.length}
                minHeight={1000}
                onGridSort={this.handleGridSort}
                enableCellSelect={false}
                enableRowSelect="single"
                rowRenderer={RowRenderer}
                rowHeight={80}
                rowActionsCell={RowAction}
              />
            }
          </div>
        </div>

        <audio ref={(el) => {
          this.beepSuccess = el
        }}
        >
          <source src={BeepSuccess} type="audio/mpeg" />
        </audio>

        <audio ref={(el) => {
          this.beepFail = el
        }}
        >
          <source src={BeepFail} type="audio/mpeg" />
        </audio>

      </Container>
    )
  }
}

Scan.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      inventoryId: PropTypes.string,
    }),
  }),
}

Scan.defaultProps = {
  match: {},
}

export default withFirebase(Scan)

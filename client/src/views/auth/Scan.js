/* global firebase */
/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import Scanner from '../../components/Scanner'
import PageHeading from '../../components/PageHeading'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import BeepFail from '../../assets/beep-fail.mp3'
import BeepSuccess from '../../assets/beep-success.mp3'
import InventoryCount from '../../dao/InventoryCount'
import ScanLog from '../../dao/ScanLog'

const getFirestoreTimestamp = firebase.firestore.Timestamp.now

class ScanLogItem extends Component {
  handleDeleteScan = async () => {
    const {
      item,
      // onDeleteItem,
    } = this.props

    await item.delete()

    // if (typeof onDeleteItem === 'function') {
    //   onDeleteItem(item)
    // }
  }

  render() {
    /* eslint-disable camelcase, react/prop-types */
    const {
      item: scanLog,
    } = this.props

    return (
      <li>
        <div className="cf">
          <div className="pa3 ba b--moon-gray near-black fl w-30">{Moment(scanLog.scannedAt).fromNow()}</div>
          <div className="pa3 ba b--moon-gray near-black fl w-30">{scanLog.upc}</div>
          <div className="pa3 ba b--moon-gray near-black fl w-10">
            <button className="link" onClick={this.handleDeleteScan}>X</button>
          </div>
        </div>
      </li>
    )
  }
}

class Scan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scanLog: [],
    }
  }

  async componentDidMount() {
    const {
      match: {
        params: {
          inventoryId,
        },
      },
    } = this.props

    const stopWatching = await ScanLog.loadCollection('po6IONOcohOE9a8U06yH', inventoryId, [], (scanLog) => {
      this.setState({ scanLog })
    })

    console.log('stopWatching', stopWatching)

    this.setState({ stopWatching })
  }

  componentWillUnmount() {
    const { stopWatching } = this.state
    stopWatching()
  }

  validateItem = (item) => {
    if (!(typeof item === 'object')) return false
    if (!('product_id' in item)) return false
    return true
  }

  handleDetected = async (upc, makeReadyForTheNextOne) => {
    // const { api } = this.props

    const {
      match: {
        params: {
          inventoryId,
        },
      },
    } = this.props

    // inventoryId = parseInt(inventoryId.toString(), 10)

    // let inventoryCount = await InventoryCount.load('po6IONOcohOE9a8U06yH', inventoryId, upc)

    const scanLog = new ScanLog({
      upc,
      scannedAt: getFirestoreTimestamp(),
    }, 'po6IONOcohOE9a8U06yH', inventoryId)

    await scanLog.save()

    // const isValid = (inventoryCount !== null)

    // if (isValid) {

    this.beepSuccess.play()

    // await api.updateCount(
    //   inventoryCount.upc,
    //   inventoryId,
    //   (parseInt(inventoryCount.fifoQty.toString(), 10) + 1),
    // )


    // inventoryCount = await api
    //   .getProductAndCountByUPC(inventoryCount.upc, inventoryId)

    makeReadyForTheNextOne()

    // this.updateScanLog(inventoryId)
    // } else {
    //   this.beepFail.play()
    //   makeReadyForTheNextOne()
    // }
  }

  // updateScanLog = async () => {
  //   const { api } = this.props
  //   const {
  //     match: {
  //       params: {
  //         inventoryId,
  //       },
  //     },
  //   } = this.props
  //
  //   const lastScanTimestamp = parseInt(this.state.scanLog
  //     .map(logItem => (logItem.scan_time ? Moment(logItem.scan_time).valueOf() : 0))
  //     .reduce((max, cur) => Math.max(max, cur), this.state.lastScanTimestamp), 10)
  //
  //   const newScan = await api.getScanLog(inventoryId, lastScanTimestamp)
  //   const scanLog = newScan.concat(this.state.scanLog)
  //
  //   this.setState({
  //     scanLog,
  //     lastScanTimestamp,
  //   })
  // }

  // handleDeleteScan = async (item) => {
  //   this.setState({
  //     scanLog: this.state.scanLog.filter(e => e !== item),
  //   })
  // }

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
    } = this.state

    // const scanLogItemIndices = []
    const scanLogItems = scanLog
      // .filter((v, i) => {
      //   scanLogItemIndices.push(v.id)
      //   return scanLogItemIndices.indexOf(v.id) === i
      // })
      .map(scanLogItem => (
        <ScanLogItem key={`scan-log-${scanLogItem.id}`} {...this.props} item={scanLogItem} />
      ))

    /* eslint-disable jsx-a11y/media-has-caption */
    return (
      <Container>
        <RoundButton
          label="< Back"
          to={`/auth/inventory/${inventoryId}`}
        />
        <PageHeading>Scan</PageHeading>
        <Scanner onDetected={this.handleDetected} />
        <div className="padded">
          <h3>Scan Log</h3>
          <ul className="list w-100 ma0 pa0">{scanLogItems}</ul>
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
  api: PropTypes.shape({}),
  match: PropTypes.shape({
    params: PropTypes.shape({
      inventoryId: PropTypes.string,
    }),
  }),
}

Scan.defaultProps = {
  api: {},
  match: {},
}

export default Scan

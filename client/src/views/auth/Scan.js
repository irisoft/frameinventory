/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import firebase from 'firebase/app'
import Scanner from '../../components/Scanner'
import PageHeading from '../../components/PageHeading'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import BeepFail from '../../assets/beep-fail.mp3'
import BeepSuccess from '../../assets/beep-success.mp3'
import ScanLog from '../../dao/ScanLog'
import withFirebase from '../../hocs/withFirebase'

const getFirestoreTimestamp = firebase.firestore.Timestamp.now

class ScanLogItem extends Component {
  /* eslint-disable camelcase, react/prop-types */

  handleDeleteScan = async () => {
    const { item } = this.props
    await item.delete()
  }

  render() {
    const { item: scanLog } = this.props

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
      .loadCollection(userProfile.organizationId, inventoryId, [], (scanLog) => {
        this.setState({ scanLog })
      })

    this.setState({ stopWatching })
  }

  componentWillUnmount() {
    const { stopWatching } = this.state
    stopWatching()
  }

  handleDetected = async (upc, makeReadyForTheNextOne) => {
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

    await scanLog.save()
    this.beepSuccess.play()
    makeReadyForTheNextOne()
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
    } = this.state

    const scanLogItems = scanLog
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

export default withFirebase(Scan)

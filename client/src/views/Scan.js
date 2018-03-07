import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import Quagga from 'quagga'
import Scanner from '../components/Scanner'
import DataAdapter from '../dataAdapters/JsonApi'
import { Link } from 'react-router-dom'
import { Navbar, Nav, Button } from 'reactstrap'
import Beep from  'browser-beep'

const beep = Beep({ frequency: 830 })
const boop = Beep({ frequency: 315 })

class Scan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scanning: true,
      scanResults: [],
      scannedItem: false,
      scanReady: false,
      failedCode: null
    }
    this.dataAdapter = new DataAdapter()
  }

  componentDidMount() {
    this.setState({ scanReady: true });
  }

  validateItem = (item) => {
    if (!(typeof item === 'object')) return false
    if (!('product_id' in item)) return false
    return true
  }

  handleDetected = async (result) => {
    let {
      match: {
        params: {
          inventoryId
        }
      },
    } = this.props

    inventoryId = parseInt(inventoryId.toString(), 10)

    Quagga.pause()
    this.setState({ scanReady: false })
    let productAndCount = await this.dataAdapter.getProductAndCountByUPC(result.codeResult.code, inventoryId)
    const isValid = this.validateItem(productAndCount)
    if (isValid) {
      beep(1)
      this.setState({ scannedItem: productAndCount, failedCode: null }, async () => {
        await this.dataAdapter.updateCount(productAndCount.upc, inventoryId, (parseInt(productAndCount.manual_qty.toString(), 10) + 1))
        productAndCount = await this.dataAdapter.getProductAndCountByUPC(productAndCount.upc, inventoryId)
        this.setState({ scannedItem: productAndCount })
      })
    } else {
      boop(2)
      this.setState({ scannedItem: false, failedCode: result.codeResult.code })
    }

    setTimeout(() => {
      Quagga.start()
      this.setState({ scanReady: true })
    }, 5000)
  }

  render() {
    const {
      match: {
        params: {
          inventoryId
        }
      },
    } = this.props

    const {
      scannedItem,
      scanning,
      scanReady,
      failedCode
    } = this.state

    const ledStyle = {
      borderRadius: '50%',
      height: 15,
      width: 15,
      position: 'absolute',
      backgroundColor: scanReady ? 'lightgreen' : 'lightsalmon',
      marginLeft: 10,
      marginTop: 30
    }

    return (
      <div>
        <div className="scanner-container">
          <div style={ledStyle}>&nbsp;</div>
          {scanning ? <Scanner onDetected={this.handleDetected}/> : null}
        </div>
        <div className="padded">
          { scannedItem ? (
            <div className="container">
              <div className="row text">
                <div className="col-6">
                  Product
                </div>
                <div className="col-3 text-right">
                  Report
                </div>
                <div className="col-3 text-right">
                  Manual
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <h4>{scannedItem.brand}</h4>
                  <div>{scannedItem.upc}</div>
                  <div>{scannedItem.description}</div>
                </div>
                <div className="col-3 text-right">
                  {scannedItem.report_qty}
                </div>
                <div className="col-3 text-right">
                  {scannedItem.manual_qty}
                </div>
              </div>
            </div>
          ) : (
            <div>
              { failedCode
                ? <i className="text-center" style={{ display: 'block' }}>Couldn't find a product for <b>{failedCode}</b></i>
                : <i className="text-center" style={{ display: 'block' }}>Scan a barcode to get started.</i>
              }
            </div>
          )
        }
        </div>
        <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
          <Nav className="bottom-nav">
            <Link to={`/inventory/${inventoryId}`}>
              <Button color="secondary" size="md"><i className="fas fa-th-list"></i> Back to List</Button>
            </Link>
          </Nav>
        </Navbar>
      </div>
    )
  }
}

Scan.propTypes = {

}

Scan.defaultProps = {

}

export default Scan

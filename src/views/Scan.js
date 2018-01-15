import React, { Component, PropTypes } from 'react'
import Quagga from 'quagga'
import Scanner from '../components/Scanner'
import Result from '../components/Result'
import DataAdapter from '../dataAdapters/LocalIndexedDB'
import { Link } from 'react-router-dom'
import { Navbar, Nav, Button } from 'reactstrap'
import Beep from  'browser-beep'

const beep = Beep({ frequency: 830 })
const boop = Beep({ frequency: 415 })

class Scan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scanning: true,
      scanResults: [],
      scannedItem: false,
      scanReady: false
    }
    this.dataAdapter = new DataAdapter()
  }

  componentDidMount() {
    this.setState({ scanReady: true });
  }

  // componentDidUpdate(prevProps, prevState) {
  //
  // }

  // handleScan = () => {
  //   this.setState({scanning: !scanning});
  // }

  validateItem = (item) => {
    if (!(typeof item === 'object')) return false
    if (!('product' in item)) return false
    if (!('inventoryCount' in item)) return false
    if (!Array.isArray(item.product)) return false
    if (!Array.isArray(item.inventoryCount)) return false
    if (item.product.length === 0) return false
    if (item.inventoryCount.length === 0) return false
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
      this.setState({ scannedItem: productAndCount }, async () => {
        const updatedCount = await this.dataAdapter.updateCount([ inventoryId, productAndCount.product[0].upc ], { manualQty: (productAndCount.inventoryCount[0].manualQty + 1) })
        console.log(`updated ${updatedCount} records`, [ inventoryId, productAndCount.product[0].upc ])
        productAndCount = await this.dataAdapter.getProductAndCountByUPC(result.codeResult.code, inventoryId)
        this.setState({ scannedItem: productAndCount })
      })
    } else {
      boop(2)
      this.setState({ scannedItem: false })
    }

    setTimeout(() => {
      Quagga.start()
      this.setState({ scanReady: true })
    }, 1000)
  }

  render() {
    const {
      match: {
        params: {
          inventoryId
        }
      },
    } = this.props

    const { scannedItem, scanning, scanReady } = this.state

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
          { scannedItem && (
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
                  <h4>{scannedItem.product[0].brand}</h4>
                  <div>{scannedItem.product[0].upc}</div>
                  <div>{scannedItem.product[0].description}</div>
                </div>
                <div className="col-3 text-right">
                  {scannedItem.inventoryCount[0].reportQty}
                </div>
                <div className="col-3 text-right">
                  {scannedItem.inventoryCount[0].manualQty}
                </div>
              </div>
            </div>
          )}
        </div>
        <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
          <Nav className="bottom-nav">
            <Link to={`/inventory/${inventoryId}`}>
              <Button color="secondary" size="md">Back</Button>
            </Link>
            {/* <a>
              <Button color="primary" size="md" onClick={this.handleScan}>{scanning ? 'Stop' : 'Start'}</Button>
            </a> */}
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

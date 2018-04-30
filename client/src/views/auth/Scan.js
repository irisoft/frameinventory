import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import { Link } from 'react-router-dom'
// import { Navbar, Nav, Button } from 'reactstrap'
import Scanner from '../../components/Scanner'
import PageHeading from '../../components/PageHeading'
import Container from '../../components/Container'
import RoundButton from '../../components/RoundButton'
import BeepFail from '../../assets/beep-fail.mp3'
import BeepSuccess from '../../assets/beep-success.mp3'

class Scan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scannedItem: false,
      failedCode: null,
    }
  }

  validateItem = (item) => {
    if (!(typeof item === 'object')) return false
    if (!('product_id' in item)) return false
    return true
  }

  handleDetected = async (result, makeReadyForTheNextOne) => {
    const { api } = this.props

    let {
      match: {
        params: {
          inventoryId,
        },
      },
    } = this.props

    inventoryId = parseInt(inventoryId.toString(), 10)

    let productAndCount = await api.getProductAndCountByUPC(result, inventoryId)
    const isValid = this.validateItem(productAndCount)
    if (isValid) {
      this.beepSuccess.play()
      this.setState({ scannedItem: productAndCount, failedCode: null }, async () => {
        await api.updateCount(
          productAndCount.upc,
          inventoryId,
          (parseInt(productAndCount.manual_qty.toString(), 10) + 1),
        )

        productAndCount = await api
          .getProductAndCountByUPC(productAndCount.upc, inventoryId)

        this.setState({ scannedItem: productAndCount }, () => {
          makeReadyForTheNextOne()
        })
      })
    } else {
      this.beepFail.play()
      this.setState({ scannedItem: false, failedCode: result }, () => {
        makeReadyForTheNextOne()
      })
    }
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
      scannedItem,
      failedCode,
    } = this.state

    return (
      <Container>
        <RoundButton
          label="< Back"
          to={`/auth/inventory/${inventoryId}`}
        />
        <PageHeading>Scan</PageHeading>
        <Scanner onDetected={this.handleDetected} />
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
                && <i className="text-center" style={{ display: 'block' }}>Couldn&apos;t find a product for <b>{failedCode}</b></i>
              }
              <i className="text-center" style={{ display: 'block' }}>Type or paste a barcode and press <b>[Enter]</b>.</i>
            </div>
          )
          }
        </div>
        {/* <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
          <Nav className="bottom-nav">
            <Link to={`/auth/inventory/${inventoryId}`}>
          <Button color="secondary" size="md"><i className="fas fa-th-list" /> Back to List</Button>
            </Link>
          </Nav>
        </Navbar> */}

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

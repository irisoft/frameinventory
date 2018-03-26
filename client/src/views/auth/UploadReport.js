import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect, Link } from 'react-router-dom'
import { Navbar, Nav, Button } from 'reactstrap'
import XLSX from 'xlsx'

class UploadReport extends Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
      readyToRedirect: false,
      inventoryId: null,
    }
  }

  onChange = (e) => {
    this.setState({ file: e.target.files[0] })
  }

  onFormSubmit = (e) => {
    e.preventDefault()

    const { file } = this.state
    const { api } = this.props
    const reader = new FileReader()

    reader.onload = (loadEvent) => {
      const data = loadEvent.target.result

      const workbook = XLSX.read(data, { type: 'binary' })

      const json = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1)

      api.createNewInventory().then(async ({ id: inventoryId }) => {
        const products = []

        json.forEach((row) => {
          const product = {
            upc: row['EAN/UPC'],
            description: row['Material Description'],
            brand: row['Product Brand'],
            type: row['Product Type'],
            salesPrices: row['Sales Price'],
            sellinPrice: row['Sell-in Price'],
            reportQty: parseInt(row.Quantity.toString(), 10),
            manualQty: 0,
          }
          products.push(product)
        })

        await api.insertProducts(inventoryId, products)
        this.setState({ readyToRedirect: true, inventoryId })
      })
    }

    reader.readAsBinaryString(file)
  }

  render() {
    const { inventoryId, readyToRedirect, file } = this.state

    return !readyToRedirect
      ? (
        <div>
          <div className="padded">
            <form onSubmit={this.onFormSubmit}>
              <input accept=".xlsx" className="btn btn-secondary btn-block" type="file" onChange={this.onChange} name="file" id="exampleFile" />
              <br />
              {file && <input className="btn btn-primary btn-block" type="submit" value="Upload" />}
            </form>
          </div>
          <Navbar light color="inverse" fixed="bottom" className="justify-content-between">
            <Nav className="bottom-nav">
              <Link to="/auth">
                <Button color="danger" size="md"><i className="fas fa-times-circle" /> Cancel</Button>
              </Link>
            </Nav>
          </Navbar>
        </div>
      )
      : (
        <Redirect to={`/auth/inventory/${inventoryId}`} />
      )
  }
}

UploadReport.propTypes = {
  auth: PropTypes.shape({
    logout: PropTypes.func,
    login: PropTypes.func,
    isAuthenticated: PropTypes.func,
  }),
  api: PropTypes.shape({}),
}

UploadReport.defaultProps = {
  auth: null,
  api: null,
}

export default UploadReport

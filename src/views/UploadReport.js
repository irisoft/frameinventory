import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Button, Input } from 'reactstrap'
import XLSX from 'xlsx'
import DataAdapter from '../dataAdapters/LocalIndexedDB'

class UploadReport extends Component {
  constructor(props) {
    super(props)

    this.state = {
      file:null,
      readyToRedirect: false,
      inventoryId: null
    }

    this.dataAdapter = new DataAdapter()
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) {

  }

  onChange = (e) => {
    this.setState({file:e.target.files[0]})
  }

  onFormSubmit = (e) => {
    e.preventDefault()

    const { file } = this.state
    const reader = new FileReader()

    reader.onload = (loadEvent) => {
      var data = loadEvent.target.result

      var workbook = XLSX.read(data, { type: 'binary' })

      const json = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'])

      this.dataAdapter.createNewInventory().then((inventoryId) => {
        const inventoryCounts = []
        const products = []

        json.forEach((row) => {
          const product = {
            upc: row['EAN/UPC'],
            description: row['Material Description'],
            brand: row['Product Brand'],
            type: row['Product Type'],
            salesPrices: row['Sales Price'],
            sellinPrice: row['Sell-in Price']
          }

          const inventoryCount = {
            inventoryId,
            upc: row['EAN/UPC'],
            reportQty: parseInt(row['Quantity'].toString(), 10),
            manualQty: 0
          }

          products.push(product)
          inventoryCounts.push(inventoryCount)
        })

        this.dataAdapter.insertProducts(products)
        this.dataAdapter.insertInventoryCounts(inventoryCounts)

        this.setState({ readyToRedirect: true, inventoryId })
      })
    }

    reader.readAsBinaryString(file)
  }

  render() {
    const { inventoryId, readyToRedirect, file } = this.state

    return !readyToRedirect ?
    (
      <div>
        <div className="padded">

          <form onSubmit={this.onFormSubmit}>
            <input accept=".xlsx" className="btn btn-secondary btn-block" type="file" onChange={this.onChange} name="file" id="exampleFile" />
            <br />
            {file && <input className="btn btn-primary btn-block" type="submit" value="Upload" />}
          </form>
        </div>
      </div>
    ) : <Redirect to={`/inventory/${inventoryId}`} />
  }
}

UploadReport.propTypes = {

}

UploadReport.defaultProps = {

}

export default UploadReport

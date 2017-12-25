import React, { Component } from 'react'
import ReactDataGrid from 'react-data-grid'
import Quagga from 'quagga'
import XLSX from 'xlsx'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import DataAdapter from './dataAdapters/LocalIndexedDB'
import Scanner from './components/Scanner'
import Result from './components/Result'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file:null,
      inventoryProductsAndCounts: [],
      ready: false,
      activeInventories: [],
      scanning: false,
      scanResults: []
    }

    this.dataAdapter = new DataAdapter()
  }

  componentDidMount() {
    this.getActiveInventory()
  }

  getActiveInventory = () => {
    this.dataAdapter.getActiveInventory().then((activeInventories) => {
      this.setState({ activeInventories, ready: true })

      if (activeInventories.length > 0) {
        this.getInventoryProductsAndCounts(activeInventories[0].id)
      }
    })
  }

  getInventoryProductsAndCounts = (inventoryId) => {
    this.dataAdapter.getInventoryProductsAndCounts(inventoryId).then((inventoryProductsAndCounts) => {
      this.setState({ inventoryProductsAndCounts })
    })
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

        this.getActiveInventory()
      })
    }

    reader.readAsBinaryString(file)
  }

  onChange = (e) => {
    this.setState({file:e.target.files[0]})
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

  handleScan = () => {
    this.setState({scanning: !this.state.scanning});
  }

  handleDetected = (result) => {
    Quagga.pause()
    this.dataAdapter.getProductAndCountByUPC(result.codeResult.code).then((productAndCount) => {
      console.log(result.codeResult.code, productAndCount)
    })
    // this.setState({ scanResults: this.state.scanResults.concat([result]) });
  }

  render() {

    const columns = [
      { key: 'upc', name: 'UPC', sortable: true, width: 175 },
      { key: 'type', name: 'Type', sortable: true, width: 175 },
      { key: 'brand', name: 'Brand', sortable: true, width: 175 },
      { key: 'description', name: 'Description', sortable: true },
      { key: 'reportQty', name: 'Report Qty', sortable: true, width: 120, cellClass: 'text-right' },
      { key: 'manualQty', name: 'Scan Qty', sortable: true, width: 120, cellClass: 'text-right' }
    ]

    const {
      inventoryProductsAndCounts,
      activeInventories,
      ready
    } = this.state

    return (
      <div className="App container-fluid">
        { ready && activeInventories.length === 0 &&
          <div className="row">
            <div className="col align-self-center">
              <h1>Upload a Report to Get Started</h1>
              <form onSubmit={this.onFormSubmit}>
                <h1>File Upload</h1>
                <input type="file" onChange={this.onChange} />
                <button type="submit">Upload</button>
              </form>
            </div>
          </div>
        }

        { ready && activeInventories.length > 0 &&
          <div className="container-fluid">
            <div className="row">
              <div className="col align-self-center">
                <h1>Currently Active Inventory</h1>
                <h3>Started {activeInventories[0].startDate.toDateString()}</h3>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <ReactDataGrid
                  columns={columns}
                  rowGetter={this.rowGetter}
                  rowsCount={inventoryProductsAndCounts.length}
                  minHeight={500}
                  onGridSort={this.handleGridSort}
                />
              </div>
              <div className="col">
                <button onClick={this.handleScan}>{this.state.scanning ? 'Stop' : 'Start'}</button>
                <ul className="results">
                  {this.state.scanResults.map((result) => (<Result key={result.codeResult.code} result={result} />))}
                </ul>
                {this.state.scanning ? <Scanner onDetected={this.handleDetected}/> : null}
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default App;

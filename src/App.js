import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

// import ReactDataGrid from 'react-data-grid'
// import Quagga from 'quagga'

import {
  Navbar,
  NavbarBrand,
  // Nav,
  // NavItem,
  // NavLink,
  // Button,
  // Container
} from 'reactstrap'


import Home from './views/Home'
import ViewInventory from './views/ViewInventory'
import Scan from './views/Scan'
import UploadReport from './views/UploadReport'

import './App.css'

// import DataAdapter from './dataAdapters/LocalIndexedDB'
// import Scanner from './components/Scanner'
// import Result from './components/Result'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {

      // inventoryProductsAndCounts: [],
      // ready: false,
      // activeInventories: [],
      // scanning: false,
      // scanResults: []
    }

    // this.dataAdapter = new DataAdapter()
  }

  componentDidMount() {
    // this.getActiveInventory()
  }

  // getActiveInventory = () => {
  //   this.dataAdapter.getActiveInventory().then((activeInventories) => {
  //     this.setState({ activeInventories, ready: true })
  //
  //     if (activeInventories.length > 0) {
  //       this.getInventoryProductsAndCounts(activeInventories[0].id)
  //     }
  //   })
  // }










  render() {



    const {
      inventoryProductsAndCounts,
      activeInventories,
      ready
    } = this.state

    return (
      <Router>
        <div>
          <Navbar light color="inverse" fixed="top" className="justify-content-between">
            <NavbarBrand><span className="text-white">Inventory</span></NavbarBrand>
          </Navbar>

          <Route exact path="/" component={Home} />
          <Route path="/upload" component={UploadReport} />
          <Route path="/inventory/:inventoryId" component={ViewInventory} />
          <Route path="/scan/:inventoryId" component={Scan} />
        </div>
      </Router>
    )

    // return (
    //   <div className="App container-fluid">
    //     { ready && activeInventories.length === 0 &&

    //     }
    //
    //     { ready && activeInventories.length > 0 &&
    //       <div className="container-fluid">
    //         <div className="row">
    //           <div className="col align-self-center">
    //             <h1>Currently Active Inventory</h1>
    //             <h3>Started {activeInventories[0].startDate.toDateString()}</h3>
    //           </div>
    //         </div>
    //         <div className="row">
    //           <div className="col">
    //             <ReactDataGrid
    //               columns={columns}
    //               rowGetter={this.rowGetter}
    //               rowsCount={inventoryProductsAndCounts.length}
    //               minHeight={500}
    //               onGridSort={this.handleGridSort}
    //             />
    //           </div>
    //           <div className="col">
    //             <button onClick={this.handleScan}>{this.state.scanning ? 'Stop' : 'Start'}</button>
    //             <ul className="results">
    //               {this.state.scanResults.map((result) => (<Result key={result.codeResult.code} result={result} />))}
    //             </ul>
    //             {this.state.scanning ? <Scanner onDetected={this.handleDetected}/> : null}
    //           </div>
    //         </div>
    //       </div>
    //     }
    //   </div>
    // );
  }
}

export default App;

import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Navbar, NavbarBrand } from 'reactstrap'
import Home from './views/Home'
import ViewInventory from './views/ViewInventory'
import Scan from './views/Scan'
import UploadReport from './views/UploadReport'
import logo from './assets/company-logo-white.png'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Router>
        <div className="max-height">
          <Navbar light color="inverse" fixed="top" className="justify-content-between">
            <NavbarBrand>
              <div className="d-flex align-items-center">
                <img alt="Irisoft Logo" height={18} src={logo} />
                &nbsp;&nbsp;
                <span className="text-white">Inventory</span>
              </div>
            </NavbarBrand>
          </Navbar>

          <Route exact path="/" component={Home} />
          <Route path="/upload" component={UploadReport} />
          <Route path="/inventory/:inventoryId" component={ViewInventory} />
          <Route path="/scan/:inventoryId" component={Scan} />
        </div>
      </Router>
    )
  }
}

export default App;


// green #8dc600
// blue  #007494
// red   #EF476F
// orang #FFD166

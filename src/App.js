import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Navbar, NavbarBrand } from 'reactstrap'
import Home from './views/Home'
import ViewInventory from './views/ViewInventory'
import Scan from './views/Scan'
import UploadReport from './views/UploadReport'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
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
  }
}

export default App;

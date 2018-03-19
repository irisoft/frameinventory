import React from 'react'
// import PropTypes from 'prop-types';
import { Route } from 'react-router-dom'
import ListInventories from './ListInventories'
import ViewInventory from './ViewInventory'
import Scan from './Scan'
import UploadReport from './UploadReport'

function AuthContainer() {
  return (
    <div>
      <Route exact path="/auth/" component={ListInventories} />
      <Route path="/auth/upload" component={UploadReport} />
      <Route path="/auth/inventory/:inventoryId" component={ViewInventory} />
      <Route path="/auth/scan/:inventoryId" component={Scan} />
    </div>
  )
}

AuthContainer.propTypes = {

}

AuthContainer.defaultProps = {

}

export default AuthContainer

import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import ListInventories from './ListInventories'
import ViewInventory from './ViewInventory'
import Scan from './Scan'
import UploadReport from './UploadReport'

function AuthContainer(props) {
  const { auth, api, authenticated } = props
  return (
    <div>
      <Route exact path="/auth/" render={componentProps => (<UploadReport {...componentProps} auth={auth} authenticated={authenticated} api={api} />)} />
      <Route path="/auth/list" render={componentProps => (<ListInventories {...componentProps} auth={auth} authenticated={authenticated} api={api} />)} />
      <Route path="/auth/inventory/:inventoryId" render={componentProps => (<ViewInventory {...componentProps} auth={auth} authenticated={authenticated} api={api} />)} />
      <Route path="/auth/scan/:inventoryId" render={componentProps => (<Scan {...componentProps} auth={auth} authenticated={authenticated} api={api} />)} />
    </div>
  )
}

AuthContainer.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.func,
    logout: PropTypes.func,
    login: PropTypes.func,
  }),
  api: PropTypes.shape({

  }),
  authenticated: PropTypes.bool,
}

AuthContainer.defaultProps = {
  auth: null,
  api: null,
  authenticated: null,
}

export default AuthContainer

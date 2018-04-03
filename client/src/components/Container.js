import React from 'react'
import PropTypes from 'prop-types'

function Container({ children }) {
  return (
    <div className="w-100 pt4 mw8 center">
      { children }
    </div>
  )
}

Container.propTypes = {
  children: PropTypes.node,
}

Container.defaultProps = {
  children: null,
}

export default Container

import React from 'react'
import PropTypes from 'prop-types'

function Container({ children, wide }) {
  return (
    <div className={`w-100 pt5 ${wide ? 'mw8' : 'mw7'} center`}>
      { children }
    </div>
  )
}

Container.propTypes = {
  children: PropTypes.node,
  wide: PropTypes.bool,
}

Container.defaultProps = {
  children: null,
  wide: false,
}

export default Container

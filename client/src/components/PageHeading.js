import React from 'react'
import PropTypes from 'prop-types'

function PageHeading({ children }) {
  return (
    <h1 className="f1 normal mb0">
      { children }
    </h1>
  )
}

PageHeading.propTypes = {
  children: PropTypes.node,
}

PageHeading.defaultProps = {
  children: null,
}

export default PageHeading

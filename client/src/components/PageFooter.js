import React from 'react'
import PropTypes from 'prop-types'

const PageFooter = ({ children }) => (
  <div className="flex items-center justify-center pa4 fixed bottom-0 bg-white w-100 left-0 shadow-1">
    {children}
  </div>
)

PageFooter.propTypes = {
  children: PropTypes.node,
}

PageFooter.defaultProps = {
  children: null,
}

export default PageFooter

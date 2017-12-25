import React from 'react'
import PropTypes from 'prop-types'

function Result(props) {
  const { result } = props

  if (!result) {
    return null
  }

  return (
    <li>
      {result.codeResult.code} [{result.codeResult.format}]
    </li>
  )
}

Result.propTypes = {
  result: PropTypes.object
}

Result.defaultProps = {
  result: {}
}

export default Result

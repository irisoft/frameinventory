import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function RoundButton({
  to,
  onClick,
  label,
  color,
  textColor,
  icon,
  mini,
  full,
}) {
  const commonClasses = `outline-0 no-underline bg-${color} br-pill shadow-1 ttu tracked dim ${textColor} dib pointer button-reset bn`

  const sizeClasses = mini
    ? 'pv2 ph3 f7'
    : 'pv3 ph4'

  const fullClasses = full
    ? 'w-100 tc'
    : ''

  const classes = `${commonClasses} ${sizeClasses} ${fullClasses}`

  if (to) {
    return (
      <Link to={to} className={`${classes}`}>
        <div className="flex items-center">
          {icon !== null && (
            <span className="mr2"><img src={icon} alt="button icon" /></span>
          )}
          {label}
        </div>
      </Link>
    )
  } else if (typeof onClick === 'function') {
    return (
      <button onClick={onClick} className={`${classes}`}>
        <div className="flex items-center justify-center">
          {icon !== null && (
            <span className="mr2"><img src={icon} alt="button icon" /></span>
          )}
          {label}
        </div>
      </button>
    )
  }
  return null
}

RoundButton.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
  label: PropTypes.string,
  color: PropTypes.oneOf(['white', 'isgreen']),
  textColor: PropTypes.oneOf(['white', 'near-black']),
  icon: PropTypes.string,
  mini: PropTypes.bool,
  full: PropTypes.bool,
}

RoundButton.defaultProps = {
  to: '',
  onClick: null,
  label: '',
  color: 'white',
  textColor: 'near-black',
  icon: null,
  mini: false,
  full: false,
}

export default RoundButton

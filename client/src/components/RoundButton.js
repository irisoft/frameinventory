import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function RoundButton({
  to, onClick, label, color, textColor, icon,
}) {
  if (to) {
    return (
      <Link to={to} className={`bg-${color} br-pill shadow-1 pv3 ph4 ttu tracked link dim ${textColor} dib pointer`}>
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
      <button onClick={onClick} className={`bg-${color} br-pill shadow-1 pv3 ph4 ttu tracked link dim ${textColor} dib pointer`}>
        <div className="flex items-center">
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
}

RoundButton.defaultProps = {
  to: '',
  onClick: null,
  label: '',
  color: 'white',
  textColor: 'near-black',
  icon: null,
}

export default RoundButton

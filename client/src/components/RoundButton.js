import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function RoundButton({
  to, label, color, textColor, icon,
}) {
  return (
    <Link to={to} className={`bg-${color} br-pill shadow-1 pv3 ph4 ttu tracked link dim ${textColor} dib`}>
      <div className="flex items-center">
        {icon !== null && (
          <span className="mr2"><img src={icon} alt="button icon" /></span>
        )}
        {label}
      </div>
    </Link>
  )
}

RoundButton.propTypes = {
  to: PropTypes.string,
  label: PropTypes.string,
  color: PropTypes.oneOf(['white', 'isgreen']),
  textColor: PropTypes.oneOf(['white', 'near-black']),
  icon: PropTypes.string,
}

RoundButton.defaultProps = {
  to: '',
  label: '',
  color: 'white',
  textColor: 'near-black',
  icon: null,
}

export default RoundButton

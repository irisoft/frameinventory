import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Moment from 'moment'
import OverArrow from '../components/OverArrow'
import UnderArrow from '../components/UnderArrow'

function InventoryListItem({
  id, timestamp, overCount, underCount, name,
}) {
  const date = new Moment(timestamp)

  return (
    <Link to={`/auth/inventory/${id}`} className="no-underline" >
      <li
        className="relative bg-animate hover-bg-white shadow-hover br2 left--2 pr4 w-100-plus4"
      >
        <div className="flex items-center bb b--black-05 lh-copy pa3 ph0 ml4">
          <div className="flex-auto">
            { name && (<h2 className="f4 b db ma0 pa0 black">{name}</h2>)}
            <h2 className="f4 fw3 db ma0 pa0 black">{date.format('dddd')}</h2>
            <h3 className="f5 fw3 db gray ma0 pa0">{date.format('MMM D')}</h3>
          </div>
          <div className="w-20 tr f3 fw3 dark-gray items-center">
            {overCount}&nbsp;&nbsp;<OverArrow />
          </div>
          <div className="w-20 tr f3 fw3 dark-gray items-center">
            {underCount}&nbsp;&nbsp;<UnderArrow />
          </div>
        </div>
      </li>
    </Link>
  )
}

InventoryListItem.propTypes = {
  id: PropTypes.string,
  timestamp: PropTypes.number,
  overCount: PropTypes.number,
  underCount: PropTypes.number,
  name: PropTypes.string,
}

InventoryListItem.defaultProps = {
  id: null,
  timestamp: null,
  overCount: 0,
  underCount: 0,
  name: null,
}

export default InventoryListItem

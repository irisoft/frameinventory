import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Moment from 'moment'
import OverArrow from '../components/OverArrow'
import UnderArrow from '../components/UnderArrow'

function InventoryListItem({
  id, timestamp, overCount, underCount,
}) {
  const date = new Moment(timestamp)

  return (
    <Link to={`/auth/inventory/${id}`} className="no-underline" >
      <li
        className="relative bg-animate hover-bg-white shadow-hover br2 left--2 pr4 w-100-plus4"
      >
        <div className="flex items-center bb b--black-05 lh-copy pa3 ph0 ml4">
          <div className="flex-auto">
            <h2 className="f3 fw3 db ma0 pa0 black">{date.format('dddd')}</h2>
            <h3 className="f4 fw3 db gray ma0 pa0">{date.format('MMM D')}</h3>
          </div>
          <div className="w-20 tr f3 fw3 dark-gray items-center">
            {overCount}&nbsp;&nbsp;<OverArrow />
          </div>
          <div className="w-20 tr f3 fw3 dark-gray items-center">
            {underCount}&nbsp;&nbsp;<UnderArrow />
          </div>
        </div>
      </li>

      {/* <ListGroupItem className="justify-content-between">
        <button className="btn btn-sm btn-success">View</button>
        {title}
        <div>
          <Badge pill color={overColor}>Over: {overCount}</Badge>
          &nbsp;
          <Badge pill color={underColor}>Under: {underCount}</Badge>
        </div>
      </ListGroupItem> */}
    </Link>
  )
}

InventoryListItem.propTypes = {
  id: PropTypes.string,
  timestamp: PropTypes.string,
  overCount: PropTypes.number,
  underCount: PropTypes.number,
}

InventoryListItem.defaultProps = {
  id: null,
  timestamp: null,
  overCount: 0,
  underCount: 0,
}

export default InventoryListItem

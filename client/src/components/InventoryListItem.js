import React from 'react'
import PropTypes from 'prop-types'
import { ListGroupItem, Badge } from 'reactstrap'
import { Link } from 'react-router-dom'

function InventoryListItem({
  id, title, overCount, underCount,
}) {
  const overColor = overCount === 0 ? 'success' : 'warning'
  const underColor = underCount === 0 ? 'success' : 'danger'

  return (
    <Link to={`/auth/inventory/${id}`} >
      <ListGroupItem className="justify-content-between">
        <button className="btn btn-sm btn-success">View</button>
        {title}
        <div>
          <Badge pill color={overColor}>Over: {overCount}</Badge>
          &nbsp;
          <Badge pill color={underColor}>Under: {underCount}</Badge>
        </div>
      </ListGroupItem>
    </Link>
  )
}

InventoryListItem.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  overCount: PropTypes.number,
  underCount: PropTypes.number,
}

InventoryListItem.defaultProps = {
  id: null,
  title: null,
  overCount: 0,
  underCount: 0,
}

export default InventoryListItem

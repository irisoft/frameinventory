import React from 'react'
import PropTypes from 'prop-types'
import { ListGroupItem, Badge } from 'reactstrap'
import { Link } from 'react-router-dom'

function InventoryListItem({ id, title, description, overCount, underCount }) {
  const overColor = overCount === 0 ? 'success' : 'warning'
  const underColor = underCount === 0 ? 'success' : 'danger'

  return (
    <Link to={`/inventory/${id}`} >
      <ListGroupItem className="justify-content-between">
        {title}
        <div>
          <Badge pill color={overColor}>{overCount}</Badge>
          &nbsp;
          <Badge pill color={underColor}>{underCount}</Badge>
        </div>
      </ListGroupItem>
    </Link>
  )
}

InventoryListItem.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  overCount: PropTypes.number,
  underCount: PropTypes.number
}

InventoryListItem.defaultProps = {
  title: null,
  description: null,
  overCount: 0,
  underCount: 0
}

export default InventoryListItem

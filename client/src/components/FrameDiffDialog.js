import React, { Component } from 'react'
import PropTypes from 'prop-types'
import OverArrow from '../components/OverArrow'
import UnderArrow from '../components/UnderArrow'

class FrameDiffDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      frames: [],
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps) {
    if (this.props.inventoryId && prevProps.inventoryId !== this.props.inventoryId) {
      this.fetchData()
    }
  }

  fetchData = async () => {
    const {
      api,
      inventoryId,
    } = this.props

    if (inventoryId) {
      this.setState({ frames: await api.getInventoryFramesDiff(inventoryId) })
    }
  }

  render() {
    const { frames } = this.state
    const {
      isOpen, onClose, status, diff,
    } = this.props
    const rows = frames.map(frame => (<li key={frame.upc}>
      <div className="cf">
        <div className="pa3 ba b--moon-gray near-black fl w-70">{frame.upc}</div>
        <div className="pa3 ba b--moon-gray near-black fl w-30">{frame.qty_diff}</div>
      </div>
    </li>))

    return (
      isOpen
        ? (<div className="fixed w-100 h-100 left-0 top-0 flex items-center justify-center bg-gray-trans">
          <div className="bg-white p0 h-75 w-30 flex flex-column items-center justify-center shadow-1 br3">
            <div className="pa2 bb b--moon-gray w-100 mb3 cf flex items-center">
              <div className="fl w-10">
                <div className="flex items-center justify-center">
                  { (status === 'over') ? <OverArrow /> : <UnderArrow /> }
                </div>
              </div>
              <div className="fl w-80">
                <h2 className="f4 bold tc">{diff} Frames { (status === 'over') ? 'More' : 'Less' }</h2>
              </div>
              <div className="fl w-10">
                <div className="flex items-center justify-center">
                  <button className="bn bg-none pointer outline-0 link dim" tabIndex={0} onClick={onClose}>x</button>
                </div>
              </div>
            </div>
            <div className="overflow-scroll h-100 tc">
              <ul className="list pl0">
                <li>
                  <div className="cf">
                    <div className="pa3 fl w-70 tracked ttu f7">UPC</div>
                    <div className="pa3 fl w-30 tracked ttu f7">QTY</div>
                  </div>
                </li>
                {rows}
              </ul>
            </div>
          </div>
        </div>)
        : null
    )
  }
}

FrameDiffDialog.propTypes = {
  api: PropTypes.shape({}),
  inventoryId: PropTypes.number,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  status: PropTypes.oneOf(['over', 'under']),
  diff: PropTypes.number,
}

FrameDiffDialog.defaultProps = {
  api: null,
  inventoryId: 0,
  isOpen: false,
  onClose: null,
  status: 'over',
  diff: 0,
}

export default FrameDiffDialog

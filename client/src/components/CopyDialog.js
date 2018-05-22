import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import OverArrow from '../components/OverArrow'
import UnderArrow from '../components/UnderArrow'
import RoundButton from '../components/RoundButton'
import copyIcon from '../assets/copy-icon.png'
import InventoryFrameDiffCollection from '../dao/InventoryFrameDiffCollection'

class FrameDiffDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: new InventoryFrameDiffCollection(),
      copied: false,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.fetchData()
    }
  }

  fetchData = async () => {
    const { fetchData } = this.props
    if (typeof fetchData === 'function') {
      this.setState({ data: await fetchData() })
    }
  }

  render() {
    const {
      data,
      copied,
    } = this.state

    const {
      isOpen,
      onClose,
      status,
      name,
      title,
    } = this.props

    const rowMapper = ({ upc, qty }) => (
      <li key={`${name}-row-${upc}`}>
        <div className="cf">
          <div className={`pa3 ba b--moon-gray near-black fl ${qty ? 'w-70' : 'w-100'}`}>{upc}</div>
          { qty && <div className="pa3 ba b--moon-gray near-black fl w-30">{qty}</div> }
        </div>
      </li>
    )

    const textMapper = ({ upc, qty }) => {
      let s = `${upc}`
      if (qty) {
        s = `${s}\t${qty}`
      }
      return s
    }

    const rows = data.items.map(rowMapper)
    const text = data.items.map(textMapper).join('\n')

    const hasQty = Array.isArray(data) && data.items.length > 0 && 'qty' in data.items[0]

    return (
      isOpen
        ? (
          <div className="fixed w-100 h-100 left-0 top-0 flex items-center justify-center bg-gray-trans">
            <div className="bg-white p0 h-75 w-30 flex flex-column items-center justify-center shadow-1 br3">
              <div className="pa2 bb b--moon-gray w-100 mb3 cf flex items-center">
                <div className="fl w-10">
                  <div className="flex items-center justify-center">
                    { (status === 'over') ? <OverArrow /> : <UnderArrow /> }
                  </div>
                </div>
                <div className="fl w-80">
                  <h2 className="f4 bold tc">{title}</h2>
                </div>
                <div className="fl w-10">
                  <div className="flex items-center justify-center">
                    <button className="bn bg-none pointer link outline-0 dim" tabIndex={0} onClick={onClose}>x</button>
                  </div>
                </div>
              </div>
              <CopyToClipboard
                text={text}
                onCopy={() => {
                  this.setState({ copied: true }, () => {
                    setTimeout(() => {
                      this.setState({ copied: false })
                    }, 5000)
                  })
                }}
              >
                <RoundButton color="isgreen" icon={copyIcon} textColor="white" label={copied ? 'Copied' : 'Copy'} onClick={() => {}} />
              </CopyToClipboard>
              <div className="overflow-scroll h-100 tc mt3 w-60">
                <ul className="list pl0">
                  <li>
                    <div className="cf">
                      <div className={`pa3 fl ${hasQty ? 'w-70' : 'w-100'} tracked ttu f7`}>UPC</div>
                      {hasQty && <div className="pa3 fl w-30 tracked ttu f7">QTY</div>}
                    </div>
                  </li>
                  {rows}
                </ul>
              </div>
            </div>
          </div>
        ) : null
    )
  }
}

FrameDiffDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  status: PropTypes.oneOf(['over', 'under']),
  fetchData: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

FrameDiffDialog.defaultProps = {
  isOpen: false,
  onClose: null,
  status: 'over',
}

export default FrameDiffDialog

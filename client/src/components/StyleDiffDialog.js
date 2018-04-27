import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import OverArrow from '../components/OverArrow'
import UnderArrow from '../components/UnderArrow'
import RoundButton from '../components/RoundButton'
import copyIcon from '../assets/copy-icon.png'

class StyleDiffDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      styles: [],
      copied: false
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
      this.setState({ styles: await api.getInventoryStylesDiff(inventoryId) })
    }
  }

  render() {
    const { styles, copied } = this.state

    const {
      isOpen,
      onClose,
      status,
      diff,
    } = this.props

    const rows = styles.map(style => (<li key={style.upc}><div className="pv3 ph4 ba b--moon-gray near-black">{style.upc}</div></li>))

    const textToCopy = styles.map(style => `${style.upc}`).join('\n')

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
                <h2 className="f4 bold tc">{diff} Styles { (status === 'over') ? 'More' : 'Less' }</h2>
              </div>
              <div className="fl w-10">
                <div className="flex items-center justify-center">
                  <button className="bn bg-none pointer outline-0 link dim" tabIndex={0} onClick={onClose}>x</button>
                </div>
              </div>
            </div>
            <CopyToClipboard text={textToCopy}
              onCopy={() => {
                this.setState({ copied: true }, () => {
                  setTimeout(() => {
                    this.setState({ copied: false })
                  }, 5000)
                })
              }}>
              <RoundButton color="isgreen" icon={copyIcon} textColor="white" label={copied ? 'Copied' : 'Copy All'} onClick={() => {}} />
            </CopyToClipboard>

            <div className="overflow-scroll h-100 tc mt3">
              <ul className="list pl0">
                <li className="gray tracked ttu f7 pb2">UPC</li>
                {rows}
              </ul>
            </div>
          </div>
        </div>)
        : null
    )
  }
}

StyleDiffDialog.propTypes = {
  api: PropTypes.shape({}),
  inventoryId: PropTypes.number,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  status: PropTypes.oneOf(['over', 'under']),
  diff: PropTypes.number,
}

StyleDiffDialog.defaultProps = {
  api: null,
  inventoryId: 0,
  isOpen: false,
  onClose: null,
  status: 'over',
  diff: 0,
}

export default StyleDiffDialog

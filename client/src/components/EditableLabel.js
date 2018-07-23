import React, { Component } from 'react'
import PropTypes from 'prop-types'

const hoverStyles = {
  position: 'absolute',
  top: 'calc(-0.25em - 1px)',
  left: 'calc(-0.25em - 1px)',
  backgroundColor: 'rgba(255,255,255,1)',
  padding: '0.25em',
  paddingBottom: '0.35em',
  border: 'solid 1px #777',
  borderRadius: '5px',
  cursor: 'pointer',
}

class EditableLabel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false,
      hovering: false,
      cancelValue: null,
    }
  }

  handleMouseOut = () => {
    this.setState({ hovering: false })
  }

  handleMouseOver = () => {
    this.setState({ hovering: true })
  }

  handleClick = () => {
    const { model, prop } = this.props
    this.setState({ editing: true, cancelValue: model[prop] })
  }

  handleChange = (e) => {
    const { model, prop } = this.props
    model[prop] = e.target.value
    this.setState({})
  }

  handleSave = () => {
    const { model } = this.props
    model.save()
    this.setState({ editing: false })
  }

  handleCancel = () => {
    const { model, prop } = this.props
    const { cancelValue } = this.state
    model[prop] = cancelValue
    this.setState({ editing: false })
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      return this.handleSave()
    }
    if (e.keyCode === 27) {
      return this.handleCancel()
    }
  }

  render() {
    const { model, prop, defaultLabel } = this.props
    const { editing, hovering } = this.state
    let contents
    if (!model || !prop) return null

    let labelValue = model[prop]
    if (labelValue === null || labelValue === '') {
      labelValue = defaultLabel
    }

    if (editing) {
      contents = (
        <div>
          <input className="outline-0" autoFocus value={model[prop]} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
          <div className="tc f7 mt2">
            <a role="button" tabIndex={0} className="f7 link" onClick={this.handleSave}>Save</a>
            {' | '}
            <a role="button" tabIndex={0} className="f7 link" onClick={this.handleCancel}>Cancel</a>
          </div>
        </div>
      )
    } else {
      contents = (
        <div onClick={this.handleClick} tabIndex={0} role="button">
          <nobr>{labelValue}</nobr>
          <div className="f7 silver mt2 tc">Click to Edit</div>
        </div>
      )
    }

    return (
      <div className="relative" onMouseEnter={this.handleMouseOver} onMouseLeave={this.handleMouseOut}>
        <div><nobr>{labelValue}</nobr></div>
        { (hovering || editing) && <div style={hoverStyles}>{contents}</div> }
      </div>
    )
  }
}

EditableLabel.propTypes = {
  model: PropTypes.shape({}).isRequired,
  prop: PropTypes.string.isRequired,
  defaultLabel: PropTypes.string,
}

EditableLabel.defaultProps = {
  defaultLabel: 'Label',
}

export default EditableLabel

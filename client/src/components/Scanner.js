import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Scanner extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      disabled: false,
      focused: false,
    }
    this.input = null
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value })
  }

  handleBlur = (event) => {
    this.setState({ focused: false })
  }

  handleFocus = (event) => {
    this.setState({ focused: true })
  }

  handleKeyPress = ({ key }) => {
    if (key === 'Enter') {
      this.setState({ disabled: true }, () => {
        const { onDetected } = this.props
        const { value } = this.state
        this.setState({ value: '' }, () => {
          if (typeof onDetected === 'function') {
            onDetected(value, () => {
              this.setState({ disabled: false }, () => {
                this.input.focus()
              })
            })
          }
        })
      })
    }
  }

  render() {
    const { focused } = this.state
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          autoFocus
          value={this.state.value}
          disabled={this.state.disabled}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          style={{
            opacity: 0.2,
            margin: 20,
            marginLeft: 'auto',
            marginRight: 'auto',
            border: 'none',
            textAlign: 'center',
            fontSize: 20,
          }}
          ref={(input) => { this.input = input }}
        />
        { !focused && <button
          className="btn btn-success"
          style={{
            margin: 'auto', marginTop: -49, marginBottom: 10, zIndex: 10,
}}
          onClick={() => { this.input.focus() }}
        >Start Scanning
                      </button>}
      </div>
    )
  }
}

Scanner.propTypes = {
  onDetected: PropTypes.func.isRequired,
}

export default Scanner

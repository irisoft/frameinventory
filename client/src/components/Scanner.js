import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RoundButton from './RoundButton'

class Scanner extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      disabled: false,
      focused: false,
      active: false,
    }
    this.input = null
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value })
  }

  handleBlur = () => {
    if (this.state.active) {
      this.input.focus()
    } else {
      this.setState({ focused: false })
    }
  }

  handleFocus = () => {
    this.setState({ focused: true })
  }

  activate = (active) => {
    this.setState({ active }, () => {
      if (active && this.input) this.input.focus()
    })

    if (typeof this.props.onActivate === 'function') {
      this.props.onActivate(active)
    }
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
    const { active } = this.state
    return (
      <div>
        { !active && (
          <RoundButton
            color="isgreen"
            textColor="white"
            onClick={() => { this.activate(true) }}
            label={<nobr>Start Scanning</nobr>}
          />
        )}
        { active && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black-90 flex flex-column items-center justify-center z-999">
            <div>
              <h4 className="silver tc tracked ttu normal mb4">Ready for Scanner</h4>
              <input
                type="text"
                autoFocus
                value={this.state.value}
                disabled={this.state.disabled}
                onChange={this.handleChange}
                onKeyPress={this.handleKeyPress}
                onBlur={this.handleBlur}
                onFocus={this.handleFocus}
                className="f2 outline-0 bn tc white code"
                style={{
                  opacity: 0.8,
                  backgroundColor: 'rgba(255,255,255,0)',
                }}
                ref={(input) => { this.input = input }}
              />
            </div>
            <div className="mt4">
              <RoundButton
                color="isgreen"
                textColor="white"
                onClick={() => { this.activate(false) }}
                label="Stop Scanning"
              />
            </div>
            <div className="mt4">
              { this.props.children }
            </div>
          </div>
        )}
      </div>
    )
  }
}

Scanner.propTypes = {
  onDetected: PropTypes.func.isRequired,
}

export default Scanner

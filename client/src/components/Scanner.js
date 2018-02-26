import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Quagga from 'quagga'

class Scanner extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    Quagga.init({
      inputStream: {
        type : "LiveStream",
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment" // or user
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      decoder: {
        readers : [ "ean_reader", "code_128_reader" ],
        multiple: false
      },
      locate: true
    }, function(err) {
      if (err) {
        return console.log(err)
      }
      Quagga.start()
    })
    Quagga.onDetected(this.handleDetected)
  }

  componentWillUnmount() {
    Quagga.offDetected(this.handleDetected);
  }

  handleDetected = (result) => {
    this.props.onDetected(result)
  }

  render() {
    return (<div id="interactive" className="viewport" style={{ width: '100%' }}/>)
  }
}

Scanner.propTypes = {
  onDetected: PropTypes.func.isRequired
}

export default Scanner

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect, Link } from 'react-router-dom'
import Dropzone from 'react-dropzone'
import Spinner from 'react-spinkit'
import XLSX from 'xlsx'
import PageHeading from '../../components/PageHeading'
import Container from '../../components/Container'
import ExcelIcon from '../../assets/excel-dark.png'
import RoundButton from '../../components/RoundButton'
import UploadIcon from '../../assets/upload-icon.png'
import FolderIcon from '../../assets/folder-open-dark.png'
import InventoryCount from '../../dao/InventoryCount'

class UploadReport extends Component {
  constructor(props) {
    super(props)

    this.state = {
      file: null,
      processingFile: false,
      readyToRedirect: false,
      inventoryId: null,
    }
  }

  onDrop = (acceptedFiles) => {
    if (acceptedFiles.length) {
      this.setState({
        file: acceptedFiles[0],
      })
    }
  }

  processFile = () => {
    this.setState({ processingFile: true }, () => {
      const { file } = this.state
      const { api } = this.props
      const reader = new FileReader()

      reader.onload = (loadEvent) => {
        const data = loadEvent.target.result

        const workbook = XLSX.read(data, { type: 'binary' })

        const json = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1)

        api.createNewInventory().then(async ({ id: inventoryId }) => {
          const products = json.map(row => new InventoryCount({
            upc: row['EAN/UPC'],
            description: row['Material Description'],
            brand: row['Product Brand'],
            type: row['Product Type'],
            salesPrice: row['Sales Price'],
            sellInPrice: row['Sell-in Price'],
            mimsQty: row.Quantity,
            fifoQty: 0,
          }, 'po6IONOcohOE9a8U06yH', inventoryId))
          await InventoryCount.saveBatch(products)
          this.setState({ readyToRedirect: true, inventoryId })
        })
      }

      reader.readAsBinaryString(file)
    })
  }

  render() {
    const {
      inventoryId, readyToRedirect, file, processingFile,
    } = this.state
    const { processFile } = this

    if (readyToRedirect) {
      return (<Redirect to={`/auth/inventory/${inventoryId}`} />)
    } else if (processingFile) {
      return (
        <Container>
          <PageHeading>Get<br />Started</PageHeading>
          <section className="mv3">
            <div className="dropzone">
              <div className="flex items-center justify-center bg-isgreen w-100 ba b--dashed b--light-silver flex pa5 br2 bw1">
                <div>
                  <div className="flex items-center space-between white lc">
                    <Spinner name="cube-grid" color="white" />
                    <span className="pl3">Processing your spreadsheet...</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Container>
      )
    }

    return (
      <Container>
        <PageHeading>Get<br />Started</PageHeading>
        <section className="mv3">
          <div className="dropzone">
            <Dropzone
              onDrop={this.onDrop}
              accept={'\u002Exlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
              className="flex items-center justify-center bg-light-gray w-100 ba b--dashed b--light-silver flex pa4 br2 bw1"
              activeClassName="bg-isgreen pa5"
              rejectClassName="bg-isorange pa5"
              disableClick
              ref={(dropzone) => { this.dropzone = dropzone }}
            >
              {({ isDragActive, isDragReject }) => {
                if (isDragReject) {
                  return (
                    <div className="white pv3">
                      That is not a <strong>XLSX spreadsheet</strong>.
                    </div>
                  )
                }

                if (isDragActive) {
                  return (
                    <div className="white pv3">
                      Now drop the file here.
                    </div>
                  )
                }

                if (file) {
                  return (
                    <div>
                      <div className="flex items-center space-between mb4 mt1 gray lh-copy tc">
                        <img className="mr2" src={ExcelIcon} alt="Excel Icon" height={24} />
                        {file.name}
                      </div>
                      <div className="mb1">
                        <RoundButton color="isgreen" textColor="white" label="Upload File" icon={UploadIcon} onClick={processFile} />
                      </div>
                    </div>
                  )
                }

                return (
                  <div>
                    <div className="flex items-center space-between mb4 mt1 gray lh-copy tc">
                      <img className="mr2" src={ExcelIcon} alt="Excel Icon" height={24} />
                      <strong>Drag and drop</strong>&nbsp;spreadsheet.
                    </div>
                    <div className="mb1">
                      <RoundButton color="isgreen" textColor="white" label="Upload New MIMs" icon={UploadIcon} onClick={() => { this.dropzone.open() }} />
                    </div>
                  </div>
                )
              }}
            </Dropzone>
          </div>

          <Link to="/auth/list" className="link">
            <div className="flex items-center justify-center bg-white shadow-1 mt4 br2 pa4 dim pointer">
              <div className="flex items-center ttu tracked black">
                <img src={FolderIcon} alt="folder icon" className="mr2" /> VIEW EXISTING REPORT
              </div>
            </div>
          </Link>
        </section>
      </Container>
    )
  }
}

UploadReport.propTypes = {
  api: PropTypes.shape({}),
}

UploadReport.defaultProps = {
  api: null,
}

export default UploadReport

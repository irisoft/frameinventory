import React, { Component } from 'react'
import Container from '../../components/Container'
import PageHeading from '../../components/PageHeading'
import PageFooter from '../../components/PageFooter'
import InventoryListItem from '../../components/InventoryListItem'
import RoundButton from '../../components/RoundButton'
import Inventory from '../../dao/Inventory'
import UploadIcon from '../../assets/upload-icon.png'

class ListInventories extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inventories: [],
    }
  }

  async componentDidMount() {
    this.setState({
      inventories: await Inventory.loadCollection('po6IONOcohOE9a8U06yH'),
    })
  }

  render() {
    const { inventories } = this.state
    const inventoriesItems = Array.isArray(inventories) && inventories.map(inventory => (
      <InventoryListItem
        key={inventory.id}
        id={inventory.id}
        timestamp={inventory.startedAt.getTime()}
        underCount={inventory.report.counts.under}
        overCount={inventory.report.counts.over}
      />
    ))

    return (
      <Container>
        <RoundButton
          label="< Back"
          to="/auth/"
        />
        <div className="flex items-end mb3">
          <div className="flex-auto">
            <PageHeading>Inventory <br />Reports</PageHeading>
          </div>
          <div className="w-10-l w-20-m tracked ttu gray f6 tr">Styles</div>
          <div className="w-10-l w-20-m tracked ttu gray f6 tr">Frames</div>
        </div>

        <ul className="list pl0 mt0 mb7">
          {inventoriesItems}
        </ul>

        <PageFooter>
          <RoundButton to="/auth" color="isgreen" textColor="white" label="Upload New MIMs" icon={UploadIcon} />
        </PageFooter>

      </Container>
    )
  }
}

export default ListInventories

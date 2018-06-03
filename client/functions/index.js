/* eslint-disable no-console */
const functions = require('firebase-functions')

function initializeSummaryObject(summary) {
  return Object.assign({}, {
    frames: 0,
    styles: 0,
    value: 0,
  }, summary)
}

function updateSummary(inventory = {}, before = {}, after = {}) {
  const {
    fifo, mims, diff, counts,
  } = inventory

  const newFifo = initializeSummaryObject(fifo)
  const newMims = initializeSummaryObject(mims)
  const newDiff = initializeSummaryObject(diff)
  const newCounts = Object.assign({}, counts)

  if (after.scannedQty > after.reportQty) {
    newCounts.over += 1
  } else if (after.scannedQty < after.reportQty) {
    newCounts.under += 1
  } else {
    newCounts.even += 1
  }

  if (before.scannedQty > before.reportQty) {
    newCounts.over -= 1
  } else if (before.scannedQty < before.reportQty) {
    newCounts.under -= 1
  } else {
    newCounts.even -= 1
  }

  if (after.scannedQty > 0 && before.scannedQty <= 0) newFifo.styles += 1
  if (after.reportQty > 0 && before.reportQty <= 0) newMims.styles += 1

  newFifo.frames -= before.scannedQty
  newFifo.frames += after.scannedQty

  newFifo.value -= before.sellInPrice
  newFifo.value += after.sellInPrice

  newMims.frames -= before.reportQty
  newMims.frames += after.reportQty

  newMims.value -= before.sellInPrice
  newMims.value += after.sellInPrice

  newDiff.frames = newMims.frames - newFifo.frames
  newDiff.styles = newMims.styles - newFifo.styles
  newDiff.value = newMims.value - newFifo.value

  return {
    fifo: newFifo,
    mims: newMims,
    diff: newDiff,
    counts: newCounts,
  }
}

exports.calculateInventorySummaryFields = functions.firestore
  .document('/organizations/{organizationId}/inventories/{inventoryId}/counts/{countId}')
  .onWrite((change) => {
    if (!change.after.exists) return

    const { before, after } = change

    const beforeData = before.data()
    const afterData = after.data()

    console.log('b/a:', before, after)
    console.log('b/a data:', beforeData, afterData)

    const inventoryRef = change.after.ref.parent.parent

    console.log('Inventory Ref: ', inventoryRef)

    return change.after.ref.firestore.runTransaction((transaction) => {
      console.log('Running Transaction: ', transaction)

      // This code may get re-run multiple times if there are conflicts.
      return transaction.get(inventoryRef).then((inventoryDoc) => {
        if (!inventoryDoc.exists) {
          throw new Error('Document does not exist!')
        }

        console.log('Inventory Doc: ', inventoryDoc)

        const inventoryData = inventoryDoc.data()

        console.log('Inventory Data: ', inventoryData)

        const updatedInventory = Object.assign(
          {},
          updateSummary(inventoryData, beforeData, afterData),
        )

        console.log('Updated: ', updatedInventory)

        transaction.update(inventoryRef, updatedInventory)
      })
    }).then(() => {
      console.log('Transaction successfully committed!')
    }).catch((error) => {
      console.log('Transaction failed: ', error)
    })
  })

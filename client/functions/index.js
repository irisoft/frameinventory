const functions = require('firebase-functions')

exports.calculateInventorySummaryFields = functions.firestore
  .document('/organizations/{organizationId}/inventories/{inventoryId}/counts/{countId}')
  .onWrite((change, context) => {
    // const { inventoryId } = context.params

    // const before = change.before.data()
    const after = change.after.exists ? change.after.data() : null

    const inventoryRef = change.after.parent().parent()

    return change.after.ref.firestore.runTransaction((transaction) => {
      // This code may get re-run multiple times if there are conflicts.
      transaction.get(inventoryRef).then((inventoryDoc) => {
        if (!inventoryDoc.exists) {
          throw new Error('Document does not exist!')
        }

        const { counts } = inventoryDoc.data()
        if (after.scannedQty > after.reportQty) {
          counts.over += 1
        } else if (after.scannedQty < after.reportQty) {
          counts.under += 1
        } else {
          counts.even += 1
        }

        transaction.update(inventoryRef, { counts })
      })
    }).then(() => {
      console.log('Transaction successfully committed!')
    }).catch((error) => {
      console.log('Transaction failed: ', error)
    })

    // If we set `/users/marie/incoming_messages/134` to {body: "Hello"} then
    // context.params.userId == "marie";
    // context.params.messageCollectionId == "incoming_messages";
    // context.params.messageId == "134";
    // ... and ...
    // change.after.data() == {body: "Hello"}
  })

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

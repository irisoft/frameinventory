/* global firebase */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const firestore = firebase.firestore()
const firestoreSettings = {
  timestampsInSnapshots: true,
}
firestore.settings(firestoreSettings)

class TuposFirestoreModel {
  static async load(docPath) {
    try {
      const doc = await firestore.doc(docPath).get()
      if (doc.exists) {
        return doc.data()
      }
      console.error('Could not locate doc:', docPath)
    } catch (error) {
      console.error('Unable to load:', docPath, error)
    }
    return null
  }

  static saveBatch(items) {
    const batchLimit = 450
    const promises = []
    const batches = [firestore.batch()]
    let batchIndex = 0
    let batchCount = 0

    const currentBatch = () => batches[batchIndex]

    const closeBatch = () => {
      if (batchCount > 0) {
        promises.push(currentBatch().commit())
        batchCount = 0
        batches.push(firestore.batch())
        batchIndex += 1
      }
    }

    items.forEach((item) => {
      if ('save' in item && typeof item.save === 'function') {
        batchCount += 1
        item.save(currentBatch())
      }

      if (batchCount >= batchLimit) {
        closeBatch()
      }
    })

    closeBatch()

    return Promise.all(promises)
  }

  collectionPath() {
    throw new Error('Method collectionPath() required for FirestoreModel')
  }

  getDataObject() {
    throw new Error('Method geDataObject() required for FirestoreModel')
  }

  firestoreRef() {
    return firestore.doc(`${this.collectionPath()}/${this.id}`)
  }

  save(batch = null) {
    try {
      if (this.id) {
        if (batch) {
          return batch.set(this.firestoreRef(), this.getDataObject())
        }
        return this.firestoreRef().set(this.getDataObject())
      }
      return firestore.collection(this.collectionPath()).add(this.getDataObject())
    } catch (e) {
      console.error(e)
    }
  }
}

export default TuposFirestoreModel

/* global firebase */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const firestore = firebase.firestore()
const database = firebase.database()

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

  static async loadCollection(collectionPath, wheres = []) {
    try {
      let collectionQuery = firestore.collection(collectionPath)
      if (Array.isArray(wheres)) {
        wheres.forEach(([fieldPath, opStr, value]) => {
          collectionQuery = collectionQuery.where(fieldPath, opStr, value)
        })
      }
      const collectionSnapshot = await collectionQuery.get()
      return collectionSnapshot.docs
    } catch (error) {
      console.error('Unable to load collection:', collectionPath, error)
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

  static getDatabaseRef(path) {
    if (!path || typeof path !== 'string') {
      throw new Error('Path required for getDatabaseRef')
    }
    return database.ref(path)
  }

  static registerDatabaseWatcher(path, watchFunction, isRealtime = false) {
    if (!path || !watchFunction || typeof path !== 'string' || typeof watchFunction !== 'function') {
      throw new Error('Path and WatchFunction are required for registerDatabaseWatcher')
    }

    const ref = TuposFirestoreModel.getDatabaseRef(path)

    if (isRealtime) {
      ref.on('value', (snapshot) => {
        watchFunction(snapshot.val())
      })
    } else {
      ref.once('value', (snapshot) => {
        watchFunction(snapshot.val())
      })
    }

    return true
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

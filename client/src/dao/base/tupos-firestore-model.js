/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/database'

// const firestore = firebase.firestore()
// const database = firebase.database()

class TuposFirestoreModel {
  static async load(docPath, watchFunction = null) {
    try {
      const doc = await firebase.firestore().doc(docPath).get()

      if (typeof watchFunction === 'function') {
        return firebase.firestore().doc(docPath).onSnapshot((docSnapshot) => {
          watchFunction(docSnapshot.data() || {})
        })
      }

      if (doc.exists) {
        return doc.data()
      }

      console.error('Could not locate doc:', docPath)
    } catch (error) {
      console.error('Unable to load:', docPath, error)
    }
    return null
  }

  static async loadCollection(collectionPath, wheres = [], orderBy = null, watchFunction = null) {
    try {
      let collectionQuery = firebase.firestore().collection(collectionPath)

      if (Array.isArray(wheres)) {
        wheres.forEach(([fieldPath, opStr, value]) => {
          collectionQuery = collectionQuery.where(fieldPath, opStr, value)
        })
      }

      if (orderBy !== null && typeof orderBy === 'object' && 'fieldPath' in orderBy) {
        const { fieldPath, directionStr = 'asc' } = orderBy
        collectionQuery = collectionQuery.orderBy(fieldPath, directionStr)
      }

      if (typeof watchFunction === 'function') {
        return collectionQuery.onSnapshot((collectionSnapshot) => {
          watchFunction(collectionSnapshot.docChanges())
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
    const batches = [firebase.firestore().batch()]
    let batchIndex = 0
    let batchCount = 0

    const currentBatch = () => batches[batchIndex]

    const closeBatch = () => {
      if (batchCount > 0) {
        promises.push(currentBatch().commit())
        batchCount = 0
        batches.push(firebase.firestore().batch())
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
    return firebase.database().ref(path)
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
    return firebase.firestore().doc(`${this.collectionPath()}/${this.id}`)
  }

  save(batch = null) {
    try {
      if (this.id) {
        if (batch) {
          return batch.set(this.firestoreRef(), this.getDataObject())
        }
        return this.firestoreRef().set(this.getDataObject())
      }
      return firebase.firestore().collection(this.collectionPath()).add(this.getDataObject())
    } catch (e) {
      console.error(e)
    }
  }

  delete() {
    try {
      return this.firestoreRef().delete()
    } catch (e) {
      console.error(`Error deleting document: ${e.toString()}`)
    }
  }
}

export default TuposFirestoreModel

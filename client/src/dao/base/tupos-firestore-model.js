/* global firebase */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

const firestore = firebase.firestore()
const firestoreSettings = {
  timestampsInSnapshots: true,
}
firestore.settings(firestoreSettings)

class TuposFirestoreModel {
  collectionPath() {
    throw new Error('Method collectionPath() required for FirestoreModel')
  }

  getDataObject() {
    throw new Error('Method geDataObject() required for FirestoreModel')
  }

  firestoreRef() {
    return firestore.doc(`${this.collectionPath()}/${this.id}`)
  }

  save() {
    try {
      if (this.id) {
        return this.firestoreRef().set(this.getDataObject())
      }
      return firestore.collection(this.collectionPath()).add(this.getDataObject())
    } catch (e) {
      console.error(e)
    }
  }
}

export default TuposFirestoreModel

import TuposFirestoreModel from './base/tupos-firestore-model'
import setString from './base/setters/string'

class User extends TuposFirestoreModel {
  constructor(json, userId = null) {
    super()
    this.organizationId = json.organizationId
    this.userId = userId
  }

  static async load(userId) {
    if (!userId || userId === '') throw new Error('Argument `userId` is required for User')
    const data = await TuposFirestoreModel.load(`/users/${userId}`)
    if (data === null) return null
    return new User(data, userId)
  }

  getDataObject() {
    return {
      organizationId: this.organizationId,
    }
  }

  collectionPath() {
    if (this.userId === '') throw new Error('Property `userId` is required for User')
    return '/users'
  }

  get id() {
    return this.userId
  }

  get organizationId() {
    return this._organizationId
  }

  set organizationId(organizationId) {
    this._organizationId = setString(organizationId, 'organizationId')
  }

  get userId() {
    return this._userId
  }

  set userId(userId) {
    this._userId = setString(userId, 'userId')
  }
}

export default User

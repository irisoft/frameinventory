// import fetch from 'cross-fetch'
// import queryString from 'query-string'
import Moment from 'moment'

class TuposModel {
  // static baseUrl({ endpoint, method }) {
  //   return window.location.origin
  // }
  //
  // static querifyParams(params) {
  //   return queryString.stringify(params)
  // }
  //
  // static headers() {
  //   return {
  //     Authorization: `Bearer ${token}`,
  //   }
  // }

  // static async get({ endpoint, method, params }) {
  //   const baseUrl = TuposModel.baseUrl({ endpoint, method })
  //   const query = TuposModel.querifyParams(params)
  //   let response
  //   let json
  //
  //   try {
  //     response = await fetch(`${baseUrl}?${query}`, {
  //       headers: TuposModel.headers(),
  //     })
  //   } catch (error) {
  //     return error
  //   }
  //
  //   try {
  //     json = await response.json()
  //     return json.response.data
  //   } catch (error) {
  //     return error
  //   }
  // }

  // static async getOne(args) {
  //   const one = await TuposModel.get(args)
  //   if (!one || Array.isArray(one) || typeof one !== 'object') {
  //     throw new Error('getOne method should return exactly one object')
  //   }
  //   return one
  // }
  //
  // static async getMany(args) {
  //   const response = await TuposModel.get(args)
  //   const { dataIn } = args
  //   const many = (typeof dataIn === 'string') ? response[dataIn] : response
  //
  //   if (!Array.isArray(many)) {
  //     throw new Error(`getMany method should return an array. Got ${typeof many} instead.`)
  //   }
  //   return many
  // }

  setterForStrings(newValue, name) {
    if (typeof newValue === 'string') {
      this[`_${name}`] = newValue
    } else {
      this[`_${name}`] = ''
    }
  }

  setterForNumbers(newValue, name, float = false, radix = 10) {
    if (!Number.isNaN(newValue)) {
      if (float) {
        this[`_${name}`] = parseFloat(newValue, radix)
      } else {
        this[`_${name}`] = parseInt(newValue, radix)
      }
    } else {
      this[`_${name}`] = NaN
    }
  }

  setterForDates(newValue, name) {
    const date = Moment(newValue)
    this[`_${name}`] = date
  }

  setterForBools(newValue, name) {
    this[`_${name}`] = !!newValue
  }
}

export default TuposModel

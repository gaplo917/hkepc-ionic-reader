/**
 * Created by Gaplo917 on 9/1/2016.
 */

const cache = new Map()

export class LocalStorageService {
  static get NAME() { return 'LocalStorageService'}

  static get DI() {
    return ($window,$localForage,rx) => new LocalStorageService($window,$localForage,rx)
  }

  constructor($window,$localForage,rx) {
    this.$localForage = $localForage
    this.rx = rx
  }
  set(key, value) {
    cache.set(key,value)

    return this.rx.Observable
      .fromPromise(this.$localForage.setItem(key,value))
  }
  
  get(key, defaultValue) {
    const value = cache.get(key)

    return value
      ? this.rx.Observable.just(value)
      : this.rx.Observable
        .fromPromise(this.$localForage.getItem(key))
        .map(data => (data !== undefined && data != null) ? data : defaultValue)
        .do(data => {
          cache.set(key, data)
        })
  }
  
  setObject(key, value) {
    cache.set(key, value)

    return this.rx.Observable
      .fromPromise(this.$localForage.setItem(key,JSON.stringify(value)))
  }
  
  getObject(key) {
    const value = cache.get(key)

    return value
      ? this.rx.Observable.just(value)
      : this.rx.Observable
        .fromPromise(this.$localForage.getItem(key))
        .map(JSON.parse)
        .do(data => {
          cache.set(key, data)
        })
  }
}
    

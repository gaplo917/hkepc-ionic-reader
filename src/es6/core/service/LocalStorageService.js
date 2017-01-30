/**
 * Created by Gaplo917 on 9/1/2016.
 */
export class LocalStorageService {
  static get NAME() { return 'LocalStorageService'}

  static get DI() {
    return ($window,$localForage,rx) => new LocalStorageService($window,$localForage,rx)
  }

  constructor($window,$localForage,rx) {
    this.$localForage = $localForage
    this.rx = rx
    this.cache = new Map()
  }
  set(key, value) {
    this.cache.set(key,value)

    return this.rx.Observable
      .fromPromise(this.$localForage.setItem(key,value))
  }
  
  get(key, defaultValue) {
    const value = this.cache.get(key)

    return value
      ? this.rx.Observable.just(value)
      : this.rx.Observable
        .fromPromise(this.$localForage.getItem(key))
        .map(data => (data !== undefined && data != null) ? data : defaultValue)
        .do(data => {
          this.cache.set(key, data)
        })
  }
  
  setObject(key, value) {
    this.cache.set(key, value)

    return this.rx.Observable
      .fromPromise(this.$localForage.setItem(key,JSON.stringify(value)))
  }
  
  getObject(key) {
    const value = this.cache.get(key)

    return value
      ? this.rx.Observable.just(value)
      : this.rx.Observable
        .fromPromise(this.$localForage.getItem(key))
        .map(JSON.parse)
        .do(data => {
          this.cache.set(key, data)
        })
  }
}
    

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
      .observeOn(this.rx.Scheduler.default)
  }
  
  get(key, defaultValue) {
    const value = this.cache.get(key)

    return value
      ? this.rx.Observable.just(value).do(_ => console.debug(`load key:${key} from cache`))
      : this.rx.Observable
        .fromPromise(this.$localForage.getItem(key))
        .map(data => data && data != null ? data : defaultValue)
        .do(data => {
          this.cache.set(key, data)
        })
        .observeOn(this.rx.Scheduler.default)
  }
  
  setObject(key, value) {
    this.cache.set(key, value)

    return this.rx.Observable
      .fromPromise(this.$localForage.setItem(key,JSON.stringify(value)))
      .observeOn(this.rx.Scheduler.default)
  }
  
  getObject(key) {
    const value = this.cache.get(key)

    return value
      ? this.rx.Observable.just(value).do(_ => console.debug(`load key:${key} from cache`))
      : this.rx.Observable
        .fromPromise(this.$localForage.getItem(key))
        .map(JSON.parse)
        .do(data => {
          this.cache.set(key, data)
        })
        .observeOn(this.rx.Scheduler.default)
  }
}
    

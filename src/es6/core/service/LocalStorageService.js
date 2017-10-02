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

    if(window.WebViewJavascriptBridge){
      return this.rx.Observable.create((observer) => {
        window.WebViewJavascriptBridge.callHandler('NATIVE_STORAGE', {
          action: "SET",
          key: key,
          value: value
        }, (responseData) => {
          observer.onNext(responseData)
          observer.onCompleted()
          return () => {}
        })
      }).subscribe()
    }
    else {
      cache.set(key,value)

      return this.rx.Observable
        .fromPromise(this.$localForage.setItem(key,value))
        .subscribe()
    }

  }
  
  get(key, defaultValue) {
    if(window.WebViewJavascriptBridge){
      const subject = new this.rx.Subject()
      return this.rx.Observable.create((observer) => {

        window.WebViewJavascriptBridge.callHandler('NATIVE_STORAGE', {
          action: "GET",
          key: key
        }, (responseData) => {
          observer.onNext(responseData)
          observer.onCompleted()
        })

        return () => {}
      })
    }
    else {
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
  }
  
  setObject(key, value) {
    if(window.WebViewJavascriptBridge){

      return this.rx.Observable.create((observer) => {
        window.WebViewJavascriptBridge.callHandler('NATIVE_STORAGE', {
          action: "SET",
          key: key,
          value: JSON.stringify(value)
        }, (responseData) => {
          observer.onNext(responseData)
          observer.onCompleted()
        })

        return () => {}
      }).subscribe()
    }
    else {
      cache.set(key, value)
      return this.rx.Observable
        .fromPromise(this.$localForage.setItem(key,JSON.stringify(value)))
        .subscribe()
    }

  }
  
  getObject(key) {
    if(window.WebViewJavascriptBridge){
      return this.rx.Observable.create((observer) => {

        window.WebViewJavascriptBridge.callHandler('NATIVE_STORAGE', {
          action: "GET",
          key: key
        }, (responseData) => {
          observer.onNext(JSON.parse(responseData))
          observer.onCompleted()
        })

        return () => {}
      })
    }
    else {
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
}
    

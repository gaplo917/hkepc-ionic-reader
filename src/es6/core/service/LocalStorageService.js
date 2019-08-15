/**
 * Created by Gaplo917 on 9/1/2016.
 */
import { Bridge, Channel } from '../bridge/index'

export class NativeStorageService {
  static get NAME () { return 'LocalStorageService' }

  static get DI () {
    return ($window, rx) => new NativeStorageService($window, rx)
  }

  static get TYPE () {
    return 'NativeStorageService'
  }

  constructor ($window, rx) {
    this.rx = rx
  }

  set (key, value) {
    return this.rx.Observable.create((observer) => {
      Bridge.callHandler(Channel.nativeStorage, {
        action: 'SET',
        key: key,
        value: value
      }, (responseData) => {
        observer.onNext(responseData)
        observer.onCompleted()
      })
    }).subscribe()
  }

  get (key, defaultValue) {
    return this.rx.Observable.create((observer) => {
      Bridge.callHandler(Channel.nativeStorage, {
        action: 'GET',
        key: key
      }, (responseData) => {
        observer.onNext(responseData)
        observer.onCompleted()
      })
    })
  }

  setObject (key, value) {
    return this.rx.Observable.create((observer) => {
      Bridge.callHandler(Channel.nativeStorage, {
        action: 'SET',
        key: key,
        value: JSON.stringify(value)
      }, () => {
        observer.onNext(true)
        observer.onCompleted()
      })
    }).subscribe()
  }

  getObject (key) {
    return this.rx.Observable.create((observer) => {
      Bridge.callHandler(Channel.nativeStorage, {
        action: 'GET',
        key: key
      }, (responseData) => {
        const jsObj = JSON.parse(responseData)
        observer.onNext(jsObj)
        observer.onCompleted()
      })
    })
  }
}

export class LocalStorageService {
  static get NAME () { return 'LocalStorageService' }

  static get DI () {
    return ($window, $localForage, rx) => new LocalStorageService($window, $localForage, rx)
  }

  static get TYPE () {
    return 'LocalStorageService'
  }

  constructor ($window, $localForage, rx) {
    this.$localForage = $localForage
    this.rx = rx
  }

  set (key, value) {
    return this.rx.Observable
      .fromPromise(this.$localForage.setItem(key, value))
      .subscribe()
  }

  get (key, defaultValue) {
    return this.rx.Observable
      .fromPromise(this.$localForage.getItem(key))
      .map(data => (data !== undefined && data != null) ? data : defaultValue)
  }

  setObject (key, value) {
    return this.rx.Observable
      .fromPromise(this.$localForage.setItem(key, JSON.stringify(value)))
      .subscribe()
  }

  getObject (key) {
    return this.rx.Observable
      .fromPromise(this.$localForage.getItem(key))
      .map(JSON.parse)
  }
}

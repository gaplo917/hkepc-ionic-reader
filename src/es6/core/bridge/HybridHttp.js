/**
 * Created by Gaplo917 on 2/10/2017.
 */
import { Bridge, Channel } from "./index";

export class HybridHttp {
  constructor($http, rx){
    this.http = $http
    this.rx = rx
  }

  request(opt){
    if(Bridge.isAvailable()){
      return this.rx.Observable.create((observer) => {
        Bridge.callHandler(Channel.apiProxy, opt, (responseData) => {
          observer.onNext(responseData)
          observer.onCompleted()
          return () => {}
        })
      })
    }
    else {
      const serializedData = this.serialize(opt.data)

      const nOpt = { ...opt, data: serializedData}

      console.log(nOpt)

      //Use Rx to wrap Angular httpPromise for better data modeling
      return this.rx.Observable.fromPromise(this.http(nOpt))
    }
  }

  serialize(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
}
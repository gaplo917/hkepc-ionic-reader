/**
 * Created by Gaplo917 on 2/10/2017.
 */

export class HybridHttp {
  constructor($http, rx){
    this.http = $http
    this.rx = rx
  }

  request(opt){
    if(window.WebViewJavascriptBridge){
      return this.rx.Observable.create((observer) => {
        window.WebViewJavascriptBridge.callHandler('API_RPOXY', opt, (responseData) => {
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
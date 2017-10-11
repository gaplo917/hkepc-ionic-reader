/**
 * Created by Gaplo917 on 2/10/2017.
 */
import { Bridge, Channel } from "./index";

export class HybridHttp {
  constructor($http, rx, ngToast){
    this.http = $http
    this.rx = rx
    this.ngToast = ngToast
  }

  request(opt){
    if(Bridge.isAvailable()){
      return this.rx.Observable.create((observer) => {
        Bridge.callHandler(Channel.apiProxy, opt, (responseData) => {
          if(responseData && responseData.status === 200){
            // have data response
            observer.onNext(responseData)
          }
          else {
            // FIXME: UI related dependency should not appear hear. Maybe need to introduce Global EventHub to decouple
            this.ngToast.danger({
              dismissOnTimeout: true,
              content: `<i class="ion-network"> 你的網絡不穩定，請重新嘗試！</i>`
            })
          }
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
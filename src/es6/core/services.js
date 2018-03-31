import * as Services from './service/index'
import {LocalStorageService, NativeStorageService} from "./service";
import {isiOSNative, isAndroidNative} from "./bridge"
/**
 * Register the service
 */

const serviceModules = angular.module('starter.services', [])

for(let key of Object.keys(Services)){
  const service = Services[key]

  if(service.TYPE === 'LocalStorageService'){
    if(!isiOSNative() && !isAndroidNative()){
      serviceModules.factory(service.NAME,service.DI)
    }

  } else if(service.TYPE === 'NativeStorageService') {
    if(isiOSNative() || isAndroidNative()) {
      serviceModules.factory(service.NAME,service.DI)
    }

  } else {
    serviceModules.factory(service.NAME,service.DI)
  }
}

export default serviceModules
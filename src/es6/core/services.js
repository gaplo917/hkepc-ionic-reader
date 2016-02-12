import * as Services from './service/index'

/**
 * Register the service
 */
const serviceModules = angular.module('starter.services', [])

for(let key of Object.keys(Services)){
  serviceModules.factory(Services[key].name,Services[key].impl)
}

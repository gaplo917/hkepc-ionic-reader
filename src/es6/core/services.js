import * as Services from './service/index'

/**
 * Register the service
 */
angular.module('starter.services', [])

.factory(Services.localStorage.name,Services.localStorage.impl)

.factory(Services.message.name,Services.message.impl)

.factory(Services.AuthService.name,Services.AuthService.impl)

.factory(Services.MessageResolver.name,Services.MessageResolver.impl)

/**
 * Created by Gaplo917 on 9/1/2016.
 */
import {LocalStorageService} from './LocalStorageService'
import {MessageService} from './MessageService'
import {AuthService} from './AuthService'
import {MessageResolver} from './MessageResolver'

export const auth = {
  name: AuthService.NAME,
  impl: (LocalStorageService,$http,ngToast) => new AuthService(LocalStorageService,$http,ngToast)

}

export const localStorage = {
  name: LocalStorageService.NAME,
  impl: ($window) => new LocalStorageService($window)
}

export const messageResolver = {
  name: MessageResolver.NAME,
  impl: ($http,$q,$sce,MessageService) => new MessageResolver($http,$q,$sce,MessageService)
}

export const message = {
  name: MessageService.NAME,
  impl: (LocalStorageService) => new MessageService(LocalStorageService)
}
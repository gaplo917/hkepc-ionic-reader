import './controllers'
import './directives'
import './services'
import * as Controllers from './controller/index'
import * as HKEPC from '../data/config/hkepc'
import * as URLUtils from '../utils/url'
import {
  NativeChangeThemeRequest,
  NativeChangeFontSizeRequest,
  NativeUpdateMHeadFixRequest, NativeUpdateNotificationRequest
} from './bridge/requests'

import {
  Bridge,
  Channel,
  isiOSNative,
  isAndroidNative,
  isLegacyAndroid,
  createIOSNativeBride,
  createAndroidNativeBridge
} from './bridge/index'

import moment from 'moment'
import 'moment/locale/zh-tw'

// identify weather is proxy client before loading the angular app
const isProxied = URLUtils.isProxy()

if (isiOSNative()) {
  createIOSNativeBride(() => initAngular())
} else if (isAndroidNative()) {
  createAndroidNativeBridge(() => initAngular())
} else {
  requestAnimationFrame(() => {
    initAngular()
  })
}

function dynamicModules () {
  if (isiOSNative() || isAndroidNative()) {
    return [
      'ionic',
      'starter.controllers',
      'starter.services',
      'starter.directives',
      'ngToast',
      'rx'
    ]
  } else {
    return [
      'ionic',
      'starter.controllers',
      'starter.services',
      'starter.directives',
      'ngToast',
      'LocalForageModule',
      'rx'
    ]
  }
}

function initAngular () {
  console.log('init angular...')

  const angularInit = angular.module('starter', dynamicModules())
    .run(function ($rootScope, ngToast, $window, $ionicScrollDelegate, $ionicConfig, $ionicSideMenuDelegate, $ionicHistory, $timeout) {
      window.moment = moment
      // export the global
      window.isiOSNative = isiOSNative()
      window.isAndroidNative = isAndroidNative()
      window.isLegacyAndroid = isLegacyAndroid()

      $rootScope.isiOSNative = isiOSNative()
      $rootScope.isAndroidNative = isAndroidNative()
      $rootScope.isLegacyAndroid = isLegacyAndroid()
      if (isiOSNative() || isAndroidNative()) {
        // shared handling
        Bridge.version((version) => {
          $rootScope.nativeVersion = version
        })

        Bridge.registerHandler(Channel.ping, (data, cb) => {
          const result = { timestamp: new Date().getTime() }
          cb(result)
        })
      }

      if (isiOSNative() || isAndroidNative()) {
        // iOS Native
        Bridge.registerHandler(Channel.nativeStorageUpdated, function (data, responseCallback) {
          console.log(`receive nativeStorageUpdated from native, data=${data}`)
          switch (data.key) {
            case 'theme':
              $rootScope.$emit(NativeChangeThemeRequest.NAME, new NativeChangeThemeRequest(data.value))
              break
            case 'fontSize':
              $rootScope.$emit(NativeChangeFontSizeRequest.NAME, new NativeChangeFontSizeRequest(data.value))
              break
            case 'mHeadFix':
              $rootScope.$emit(NativeUpdateMHeadFixRequest.NAME, new NativeUpdateMHeadFixRequest(data.value))
              break
            case 'notification':
              if (data.value) {
                const payload = JSON.parse(data.value)
                $rootScope.$emit(NativeUpdateNotificationRequest.NAME, new NativeUpdateNotificationRequest(payload.pm, payload.post))
              } else {
                console.warn('structure of notification update from native is not correct')
              }
              break
            default:
              break
          }
        })

        Bridge.registerHandler(Channel.statusBarDidTap, (data) => {
          $ionicScrollDelegate.scrollTo(0, 0, true)
        })

        $rootScope.onBack = () => {
          console.log('onBack()')
          $ionicHistory.goBack()
        }
      } else if (isLegacyAndroid()) {
        // Legacy Android (no bridge)
        $rootScope.openDrawer = () => {
          window.LegacyAndroid.openDrawer()
        }

        $rootScope.darkTheme = (theme) => {
          window.LegacyAndroid.darkTheme(theme)
        }

        $rootScope.notification = (jsonStr) => {
          window.LegacyAndroid.notification(jsonStr)
        }

        $rootScope.username = (username) => {
          window.LegacyAndroid.username(username)
        }
      } else {
        // Web
        $rootScope.openDrawer = () => {
          $ionicSideMenuDelegate.toggleLeft()
        }
      }
    })
    .run(function ($ionicPlatform) {
      // Any thing need to do??
      $ionicPlatform.ready(function () {})
    })
    .config(['$ionicConfigProvider', function ($ionicConfigProvider) {
      $ionicConfigProvider.scrolling.jsScrolling(false)
      $ionicConfigProvider.views.forwardCache(false)
      $ionicConfigProvider.views.maxCache(4)
      $ionicConfigProvider.spinner.icon('android')
      $ionicConfigProvider.tabs.style('standard')
      $ionicConfigProvider.tabs.position('bottom')
      $ionicConfigProvider.views.swipeBackEnabled(false)
      $ionicConfigProvider.navBar.alignTitle('center')
      $ionicConfigProvider.views.transition('ios')

      // always load all templates to prevent white screen
      $ionicConfigProvider.templates.maxPrefetch(0)

      $ionicConfigProvider.backButton.icon('ion-ios-arrow-thin-left')
      $ionicConfigProvider.backButton.text('')
      $ionicConfigProvider.backButton.previousTitleText(false)

      if (isAndroidNative()) {
        $ionicConfigProvider.templates.maxPrefetch(0)
      }
    }])
    .config(function ($stateProvider, $urlRouterProvider) {
      const stateProvider = $stateProvider

      for (const key of Object.keys(Controllers)) {
        const controller = Controllers[key]
        stateProvider.state(controller.STATE, controller.CONFIG)
      }

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/tab/topics')
    })
    .config(['ngToastProvider', function (ngToast) {
      ngToast.configure({
        timeout: '2000',
        verticalPosition: 'top',
        horizontalPosition: 'right',
        animation: 'slide',
        combineDuplications: true
      })
    }])

  // partial init for Web and legacy android
  if (!isiOSNative() && !isAndroidNative()) {
    angularInit
      .config(['$httpProvider', function ($httpProvider) {
        // true if ionic is run in ios/android to allow use of cookies
        $httpProvider.defaults.withCredentials = true

        // always use async is a good practice
        $httpProvider.useApplyAsync(true)
      }])
      .provider('HKEPC_PROXY', [function () {
        this.$get = (rx, $q, ngToast, LocalStorageService) => {
          return {
            request: function (config) {
              const deferred = $q.defer()

              rx.Observable.combineLatest(
                LocalStorageService.get('proxy', HKEPC.proxy),
                LocalStorageService.get(HKEPC.auth.id),
                LocalStorageService.get(HKEPC.auth.token),
                (proxyInDb, authId, token) => {
                  return {
                    proxyInDb: proxyInDb,
                    authId: authId,
                    token: token
                  }
                }).subscribe(({ proxyInDb, authId, token }) => {
                if (isProxied) {
                  // we need to proxy all the request to prevent CORS

                  if (config.url.indexOf(HKEPC.baseUrl) >= 0) {
                    const proxy = proxyInDb || HKEPC.proxy
                    // rewrite the url with proxy
                    config.url = config.url.replace('https://www.hkepc.com/', `${proxy}/`)

                    console.debug('proxied request', config.url)
                  }
                }
                config.headers['HKEPC-Token'] = `${HKEPC.auth.id}=${authId};${HKEPC.auth.token}=${token}`
                config.timeout = 30000 // 30 seconds should be enough to transfer plain HTML text

                deferred.resolve(config)
              }, () => {
                deferred.resolve(config)
              })

              return deferred.promise
            },
            responseError: function (err) {
              if (err.status === 404) {
                ngToast.danger({
                  dismissOnTimeout: false,
                  content: `<i class="ion-network"> 找不到相關的內容！</i>`,
                  combineDuplications: true
                })
              } else if (err.status === -1) {
                ngToast.danger({
                  dismissOnTimeout: true,
                  content: `<i class="ion-network"> 你的網絡不穩定，請重新嘗試！</i>`,
                  combineDuplications: true
                })
              } else {
                ngToast.danger({
                  dismissOnTimeout: true,
                  content: `<i class="ion-network"> 連線出現問題！有可能產生此問題的原因: 網絡不穩定、連線逾時、EPC 伺服器出現異常</i>`,
                  combineDuplications: true
                })
              }

              console.log('$http Error', JSON.stringify(err))
              return err
            }
          }
        }
      }])
      .config(function ($httpProvider) {
        $httpProvider.interceptors.push('HKEPC_PROXY')
      })
      .config(['$localForageProvider', function ($localForageProvider) {
        $localForageProvider.config({
          name: 'HKEPCIR', // name of the database and prefix for your data, it is "lf" by default
          version: 1.0, // version of the database, you shouldn't have to use this
          storeName: 'keyvaluepairs', // name of the table
          description: 'Simple persistant storage'
        })
      }])
  }

  angular.bootstrap(document, ['starter'])
}

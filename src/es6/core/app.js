import controllerModules from './controllers'
import directivesModules from './directives'
import servicesModules from './services'
import * as Controllers from './controller/index'
import * as HKEPC from '../data/config/hkepc'
import * as URLUtils from '../utils/url'
const uuid = require('uuid-v4');

import {NativeChangeThemeRequest} from './bridge/NativeChangeThemeRequest'
import {NativeChangeFontSizeRequest} from './bridge/NativeChangeFontSizeRequest'
import {NativeHideUsernameRequest} from './bridge/NativeHideUsernameRequest'

import {Bridge, Channel} from "./bridge/index";
require('angulartics')

const moment = require('moment')
require('moment/locale/zh-tw');

// identify weather is proxy client before loading the angular app
const isProxied = URLUtils.isProxy()

function isiOSNative(){
  return window.webkit && window.webkit.messageHandlers &&  window.webkit.messageHandlers.isIRNative
}

function isAndroidNative(){
  return window.Android
}

function setupWebViewJavascriptBridge(callback) {
  if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
  if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
  window.WVJBCallbacks = [callback];
  var WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'https://__bridge_loaded__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
}

if(isiOSNative()){
  setupWebViewJavascriptBridge(bridge => {
    console.log("web view javascript bridge ready")
    Bridge.instance = bridge
    Bridge.instance.platform = 'ios'

    window.Bridge = Bridge
    initAngular()
  })
}
else if (isAndroidNative()){
  console.log("Android webview bridge is ready", window.Android)

  let port = null;
  onmessage = function (e) {
    console.log("Native trigger ready", e)

    // ensure only run once
    if(!e.ports[0] || port !== null) return

    port = e.ports[0]

    const messagesFromNative = new Rx.Subject()

    port.onmessage = function(f) {
      try {
        const jsObj = JSON.parse(f.data)
        console.log(`receieve data from native `, jsObj)
        messagesFromNative.onNext(jsObj)

      } catch (e){
        console.warn(`message from native encounter parsing error "${f.data}"`, e)
      }
    }

    Bridge.instance = {
      platform: 'android',
      // call native
      callHandler: (channel, opt, cb) => {
        const uid = uuid()

        port.postMessage(JSON.stringify({
          uid: uid,
          channel: channel,
          data: JSON.stringify(opt)
        }))

        if(typeof cb === "function"){
          // caller expected a reply
          messagesFromNative
            .asObservable()
            .filter(msg => msg.channel === channel && msg.uid === uid)
            .timeout(30 * 1000)
            .take(1)
            .subscribe((msg) => {
              // TODO: Should do Optimization
              try {
                const jsObj = JSON.parse(msg.data)
                cb(jsObj)
              } catch (e){
                cb(msg.data)
              }
            }, (err) => { console.warn(err) })
        }
      },
      // receive native message
      registerHandler: (channel, cb) => {
        messagesFromNative
          .filter(msg => msg.channel === channel)
          .subscribe((msg) => {
            // create a response call back
            const responseCb = (data) => {
              port.postMessage(JSON.stringify({
                uid: msg.uid,
                channel: msg.channel,
                data: JSON.stringify(data)
              }))
            }

            if(typeof cb === "function") cb(msg.data, responseCb)
          })
      }
    }

    window.Bridge = Bridge

    initAngular()
  }


}
else {
  requestAnimationFrame(() => {
    initAngular()
  })
}

function initAngular(){
  console.log("init angular...")
  angular.module('starter', [
    'ionic',
    'starter.controllers',
    'starter.services',
    'starter.directives',
    'ngToast',
    'ionicLazyLoad',
    'angulartics',
    require('angulartics-google-analytics'),
    'LocalForageModule',
    'rx',
    'ngFileUpload',
  ])
    .run(function($rootScope,ngToast, $window, $ionicScrollDelegate, $ionicConfig, $ionicSideMenuDelegate) {
      window.moment = moment
      // export the global
      window.isiOSNative = isiOSNative
      window.isAndroidNative = isAndroidNative
      $rootScope.isiOSNative = isiOSNative
      $rootScope.isAndroidNative = isAndroidNative

      if(isiOSNative()) {

        Bridge.registerHandler(Channel.nativeStorageUpdated, function (data, responseCallback) {
          switch (data.key) {
            case "theme":
              $rootScope.$emit(NativeChangeThemeRequest.NAME, new NativeChangeThemeRequest(data.value))
              break
            case "fontSize":
              $rootScope.$emit(NativeChangeFontSizeRequest.NAME, new NativeChangeFontSizeRequest(data.value))
              break
            case "hideUsername":
              $rootScope.$emit(NativeHideUsernameRequest.NAME, new NativeHideUsernameRequest(data.value))
              break
            default:
              break
          }
        })

        Bridge.registerHandler(Channel.statusBarDidTap, (data) => {
          $ionicScrollDelegate.scrollTo(0, 0, true)
        })
      }
      else if(isAndroidNative()){
        $rootScope.openDrawer = () => {
          window.Android.openDrawer()
        }
      }
      else {
        $rootScope.openDrawer = () => {
          console.log(".toggleLeft()")
          $ionicSideMenuDelegate.toggleLeft()
        }
      }
    })
    .run(function($ionicPlatform,LocalStorageService,$ionicConfig) {
      $ionicPlatform.ready(function() {
      })
    })
    .config(['$ionicConfigProvider',function($ionicConfigProvider){

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
      $ionicConfigProvider.templates.maxPrefetch(5)

      $ionicConfigProvider.backButton.icon("ion-ios-arrow-thin-left")
      $ionicConfigProvider.backButton.text("")
      $ionicConfigProvider.backButton.previousTitleText(false)

      if(isAndroidNative()){
        $ionicConfigProvider.templates.maxPrefetch(0)
      }
    }])
    .config(function ($analyticsProvider) {
      // turn off automatic tracking
      $analyticsProvider.virtualPageviews(true)
    })
    .config(function($stateProvider, $urlRouterProvider) {

      const stateProvider =  $stateProvider

      for(let key of Object.keys(Controllers)){
        const controller = Controllers[key]
        stateProvider.state(controller.STATE,controller.CONFIG)
      }

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/tab/topics');

    })
    .config(['$httpProvider', function($httpProvider) {
      if (isiOSNative()|| isAndroidNative()){
        // Native App No Need
      }
      else {
        // true if ionic is run in ios/android to allow use of cookies
        if(isProxied){
          $httpProvider.defaults.withCredentials = false
        } else {
          $httpProvider.defaults.withCredentials = true
        }

        // always use async is a good practice
        $httpProvider.useApplyAsync(true)
      }

    }])
    .provider('HKEPC_PROXY',[function(){
      if (isiOSNative() || isAndroidNative()){
        // Native App No Need
        this.$get = () => {}
      }
      else {
        this.$get = (rx, $q, ngToast, LocalStorageService) =>{
          return {
            request: function(config) {
              var deferred = $q.defer()

              rx.Observable.combineLatest(
                LocalStorageService.get('proxy',HKEPC.proxy),
                LocalStorageService.get(HKEPC.auth.id),
                LocalStorageService.get(HKEPC.auth.token),
                (proxyInDb, authId, token) => {
                  return {
                    proxyInDb: proxyInDb,
                    authId: authId,
                    token: token
                  }
                }).subscribe(({proxyInDb, authId, token}) => {
                if(isProxied) {
                  // we need to proxy all the request to prevent CORS

                  if(config.url.indexOf(HKEPC.baseUrl) >= 0){

                    const proxy = proxyInDb || HKEPC.proxy
                    // rewrite the url with proxy
                    config.url = config.url.replace('https://',`${proxy}/`)

                    console.debug("proxied request", config.url)
                  }
                  config.headers['HKEPC-Token'] = `${HKEPC.auth.id}=${authId};${HKEPC.auth.token}=${token}`

                }
                config.timeout = 30000 // 30 seconds should be enough to transfer plain HTML text

                deferred.resolve(config)
              }, (err) => {
                deferred.resolve(config)
              })

              return deferred.promise
            },
            responseError: function(err){

              if(err.status == 404){
                ngToast.danger({
                  dismissOnTimeout: false,
                  content: `<i class="ion-network"> 找不到相關的內容！</i>`
                })
              }
              else if (err.status == -1){
                ngToast.danger({
                  dismissOnTimeout: true,
                  content: `<i class="ion-network"> 你的網絡不穩定，請重新嘗試！</i>`
                })
              }
              else {
                ngToast.danger({
                  dismissOnTimeout: true,
                  content: `<i class="ion-network"> 連線出現問題！有可能產生此問題的原因: 網絡不穩定、連線逾時、Proxy 伺服器出現異常</i>`
                })
              }

              console.log('$http Error',JSON.stringify(err))
              return err
            }
          }
        }
      }

    }])
    .config(function($httpProvider) {
      if (isiOSNative() || isAndroidNative()){
        // Native App No Need
      }
      else {
        $httpProvider.interceptors.push('HKEPC_PROXY')
      }
    })
    .config(['ngToastProvider', function(ngToast) {
      ngToast.configure({
        timeout:'2000',
        verticalPosition: 'top',
        horizontalPosition: 'right',
        animation: "slide"
      })
    }])
    .config(['$localForageProvider', function($localForageProvider){
      if (isiOSNative() || isAndroidNative()){
        // Native App No Need
      }
      else {
        $localForageProvider.config({
          name        : 'HKEPCIR', // name of the database and prefix for your data, it is "lf" by default
          version     : 1.0, // version of the database, you shouldn't have to use this
          storeName   : 'keyvaluepairs', // name of the table
          description : 'Simple persistant storage'
        })
      }

    }])

  angular.bootstrap(document, ['starter'])
}

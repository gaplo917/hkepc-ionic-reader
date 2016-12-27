import controllerModules from './controllers'
import directivesModules from './directives'
import servicesModules from './services'
import * as Controllers from './controller/index'
import * as HKEPC from '../data/config/hkepc'
import * as URLUtils from '../utils/url'

// identify weather is proxy client before loading the angular app
const isProxied = URLUtils.isProxy()

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'starter.controllers',
  'starter.services',
  'starter.directives',
  'angular-loading-bar',
  'ngToast',
  'ionicLazyLoad',
  'angulartics',
  'angulartics.google.analytics',
  'LocalForageModule',
  'rx',
  'ngFileUpload',
  'monospaced.elastic'
])
.run(function($ionicPlatform,LocalStorageService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false)
      cordova.plugins.Keyboard.disableScroll(true)

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.overlaysWebView(true)

      LocalStorageService.get('theme').subscribe(data => {
        const darkTheme = data == 'dark'
        if(darkTheme){
          StatusBar.styleLightContent()
        } else {
          StatusBar.styleDefault()
        }
      })

    }
  })
})
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
  // true if ionic is run in ios/android to allow use of cookies
  if(isProxied){
    $httpProvider.defaults.withCredentials = false

  } else {
    $httpProvider.defaults.withCredentials = true

  }

  // always use async is a good practice
  $httpProvider.useApplyAsync(true)
}])
.config(['$ionicConfigProvider',function($ionicConfigProvider){
  "use strict";
  $ionicConfigProvider.scrolling.jsScrolling(false)
  $ionicConfigProvider.views.maxCache(5)
  $ionicConfigProvider.spinner.icon('ripple')
  $ionicConfigProvider.tabs.style('standard')
  $ionicConfigProvider.tabs.position('bottom')
  $ionicConfigProvider.views.swipeBackEnabled(false)
  $ionicConfigProvider.navBar.alignTitle('center')

  // focus on content, should not have fancy transition
  $ionicConfigProvider.views.transition('none')
}])
.provider('HKEPC_PROXY',[function(){

  this.$get = (rx, $q, ngToast, LocalStorageService) =>{
    return {
      request: function(config) {
        var deferred = $q.defer()

        rx.Observable.combineLatest(
          LocalStorageService.get('proxy'),
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
                config.url = config.url.replace('http://',`${proxy}/`)

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
        "use strict";
        ngToast.danger({
          dismissOnTimeout: true,
          content: `<i class="ion-network"> 連線出現問題！有可能產生此問題的原因: 網絡不穩定、連線逾時、Proxy 伺服器出現異常</i>`
        })
        console.log('$http Error',JSON.stringify(err))
        return err
      }
    }
  }
}])
.config(function($httpProvider) {
  $httpProvider.interceptors.push('HKEPC_PROXY')
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

  $localForageProvider.config({
    name        : 'HKEPCIR', // name of the database and prefix for your data, it is "lf" by default
    version     : 1.0, // version of the database, you shouldn't have to use this
    storeName   : 'keyvaluepairs', // name of the table
    description : 'Simple persistant storage'
  })

}])


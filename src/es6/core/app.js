import * as Controllers from './controller/index'
import * as HKEPC from '../data/config/hkepc'
import * as URLUtils from '../utils/url'
import 'babel-polyfill'
import 'angular-loading-bar'

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
  'angulartics.google.analytics'
])
.run(function($ionicPlatform) {
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
      StatusBar.styleDefault()
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
  $httpProvider.defaults.withCredentials = true

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

  this.$get = ['ngToast','LocalStorageService', function(ngToast, LocalStorageService){
    return {
      request: function(config) {
        if(isProxied) {
          // we need to proxy all the request to prevent CORS

          if(config.url.indexOf(HKEPC.baseUrl) >= 0){

            const proxy = LocalStorageService.get('proxy') || HKEPC.proxy
            // rewrite the url with proxy
            config.url = config.url.replace('http://',`${proxy}/`)
          }
          config.headers['HKEPC-Token'] = `${HKEPC.auth.id}=${LocalStorageService.get(HKEPC.auth.id)};${HKEPC.auth.token}=${LocalStorageService.get(HKEPC.auth.token)}`

        }
        config.timeout = 30000 // 30 seconds should be enough to transfer plain HTML text

        return config
      },
      responseError: function(err){
        "use strict";
        ngToast.danger({
          dismissOnTimeout: false,
          content: `<i class="ion-network"> 連線出現問題！有可能產生此問題的原因: 網絡不穩定、連線逾時、Proxy 伺服器出現異常</i>`
        })
        console.log('$http Error',JSON.stringify(err))
        return err
      }
    }
  }]
}])
.config(function($httpProvider) {
  $httpProvider.interceptors.push('HKEPC_PROXY')
})
.config(['ngToastProvider', function(ngToast) {
  ngToast.configure({
    timeout:'3000',
    verticalPosition: 'top',
    horizontalPosition: 'center',
    animation: "slide"
  });
}]);


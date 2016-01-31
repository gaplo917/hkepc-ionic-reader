import * as Controllers from './controller/index'
import 'angular-loading-bar'
import * as HKEPC from '../data/config/hkepc'
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
  'ngCookies',
  'ngToast'
])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)
      cordova.plugins.Keyboard.disableScroll(true)

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.overlaysWebView(true)
      StatusBar.styleDefault()
    }
  })
})
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state(Controllers.tab.state,Controllers.tab.config)

  // Each tab has its own nav history stack:
  .state(Controllers.topics.state, Controllers.topics.config)
  .state(Controllers.posts.state, Controllers.posts.config)
  .state(Controllers.post.state, Controllers.post.config)
  .state(Controllers.chats.state,Controllers.chats.config)
  .state(Controllers.chat.state,Controllers.chat.config)
  .state(Controllers.auth.state,Controllers.auth.config)
  .state(Controllers.notification.state,Controllers.notification.config)

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/account');

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
.provider('HKEPC_CORS',[function(){

  this.$get = ['$cookies','ngToast','$localstorage', function($cookies,ngToast, $localstorage){
    return {
      'request': function(config) {
        if(config.url.indexOf(HKEPC.baseUrl) >= 0){

          const proxy = $localstorage.get('proxy') || HKEPC.proxy
          // rewrite the url with proxy
          config.url = config.url.replace('http://',`${proxy}/`)
        }
        config.headers['HKEPC-Token'] = `${HKEPC.auth.id}=${$cookies.get(HKEPC.auth.id)};${HKEPC.auth.token}=${$cookies.get(HKEPC.auth.token)}`

        return config;
      },
      responseError: function(err){
        "use strict";
        ngToast.danger(`<i class="ion-network"> 連線出現問題！</i>`)
        console.log('$http Error',JSON.stringify(err))
      }
    }
  }]
}])
.config(function($httpProvider) {
  $httpProvider.interceptors.push('HKEPC_CORS')
})


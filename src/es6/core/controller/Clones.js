import * as Controllers from "./index"

/**
 *  Just a Clone Controller for display in features tab
 */
export class FeatureViewPostController extends Controllers.PostDetailController {
  static get STATE() { return 'tab.features-view-post'}
  static get NAME() { return 'FeatureViewPostController'}
  static get CONFIG() { return {
    url: '/features/topics/:topicId/posts/:postId/page/:page?delayRender=&focus=',
    views: {
      'main': {
        templateUrl: 'templates/post-detail.html',
        controller: FeatureViewPostController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet,apiService,rx,$timeout, $ionicPopup, $rootScope, $compile) {
    super($scope, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet,apiService,rx,$timeout,$ionicPopup, $rootScope, $compile)
  }


  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }


}

/**
 *  Likes Tab
 */
export class LikesViewPostController extends Controllers.PostDetailController {
  static get STATE() { return 'tab.likes-view-post'}
  static get NAME() { return 'LikesViewPostController'}
  static get CONFIG() { return {
    url: '/likes/topics/:topicId/posts/:postId/page/:page?delayRender=&focus=',
    views: {
      'main': {
        templateUrl: 'templates/post-detail.html',
        controller: LikesViewPostController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet,apiService,rx,$timeout,$ionicPopup,$rootScope, $compile) {
    super($scope, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet,apiService,rx,$timeout,$ionicPopup,$rootScope, $compile)
  }


  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.LikesController.STATE)
    }
  }


}
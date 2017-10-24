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
      'tab-features': {
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

export class FeatureWriteReplyPostController extends Controllers.WriteReplyPostController {
  static get STATE() { return 'tab.features-posts-detail-reply'}
  static get NAME() { return 'FeatureWriteReplyPostController'}
  static get CONFIG() { return {
    url: '/features/topics/:topicId/posts/:postId/page/:page/reply?message=&reply=',
    cache: false,
    views: {
      'tab-features': {
        templateUrl: 'templates/write-reply-post.html',
        controller: FeatureWriteReplyPostController.NAME,
        controllerAs: 'vm'
      },
    }
  }}
  constructor($scope,$state,$stateParams,$ionicHistory,ngToast, apiService, $ionicPopup, $rootScope) {
    super($scope,$state,$stateParams,$ionicHistory,ngToast, apiService, $ionicPopup, $rootScope)
  }
}

export class FeatureEditPostController extends Controllers.EditPostController{
  static get STATE() { return 'tab.features-posts-edit'}

  static get NAME() { return 'FeatureEditPostController'}

  static get CONFIG() {
    return {
      url:   '/features/topics/:topicId/posts/:postId/page/:page/edit?message=',
      cache: false,
      views: {
        'tab-features': {
          templateUrl:  'templates/edit-post.html',
          controller:   FeatureEditPostController.NAME,
          controllerAs: 'vm'
        },
      }
    }
  }

  constructor($scope, $state, $stateParams, $ionicHistory, ngToast, apiService, $ionicPopup, $rootScope) {
    super($scope, $state, $stateParams, $ionicHistory, ngToast, apiService, $ionicPopup, $rootScope)
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
      'tab-likes': {
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


export class LikesWriteReplyPostController extends Controllers.WriteReplyPostController {
  static get STATE() { return 'tab.likes-posts-detail-reply'}
  static get NAME() { return 'FeatureWriteReplyPostController'}
  static get CONFIG() { return {
    url: '/likes/topics/:topicId/posts/:postId/page/:page/reply?message=&reply=',
    cache: false,
    views: {
      'tab-likes': {
        templateUrl: 'templates/write-reply-post.html',
        controller: LikesWriteReplyPostController.NAME,
        controllerAs: 'vm'
      },
    }
  }}
  constructor($scope,$state,$stateParams,$ionicHistory,ngToast, apiService, $ionicPopup, $rootScope) {
    super($scope,$state,$stateParams,$ionicHistory,ngToast, apiService, $ionicPopup, $rootScope)
  }
}

export class LikesEditPostController extends Controllers.EditPostController{
  static get STATE() { return 'tab.likes-posts-edit'}

  static get NAME() { return 'LikesEditPostController'}

  static get CONFIG() {
    return {
      url:   '/likes/topics/:topicId/posts/:postId/page/:page/edit?message=',
      cache: false,
      views: {
        'tab-likes': {
          templateUrl:  'templates/edit-post.html',
          controller:   LikesEditPostController.NAME,
          controllerAs: 'vm'
        },
      }
    }
  }

  constructor($scope, $state, $stateParams, $ionicHistory, ngToast, apiService, $ionicPopup, $rootScope) {
    super($scope, $state, $stateParams, $ionicHistory, ngToast, apiService, $ionicPopup, $rootScope)
  }
}
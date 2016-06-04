/**
 * Created by Gaplo917 on 11/1/2016.
 */
//import * as cheerio from 'cheerio';
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/FindMessageRequest"
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
import {PostController} from "./PostController"

import * as Controllers from "./index"

/**
 *  Just a Clone Controller for display in features tab
 */
export class ViewPostController extends PostController {
  static get STATE() { return 'tab.features-view-post'}
  static get NAME() { return 'ViewPostController'}
  static get CONFIG() { return {
    url: '/features/topics/:topicId/posts/:postId/page/:page?delayRender=&focus=',
    views: {
      'tab-features': {
        templateUrl: 'templates/post-detail.html',
        controller: ViewPostController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,$http, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService) {
    super($scope,$http, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService)
  }


  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && history.backView.stateParams && history.backView.stateParams.postId != history.currentView.stateParams.postId){
      this.ionicHistory.goBack()
    } else {
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }


}
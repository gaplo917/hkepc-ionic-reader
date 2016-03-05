/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/FindMessageRequest"

const cheerio = require('cheerio')
const async = require('async')

export class FeatureRouteController{
  static get STATE() { return 'tab.features'}
  static get NAME() { return 'FeatureRouteController'}
  static get CONFIG() { return {
    url: '/features',
    views: {
      'tab-features': {
        templateUrl: 'templates/features/index.html',
        controller: FeatureRouteController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,$rootScope, $http, AuthService,$state,$sce,ngToast,LocalStorageService){

    this.http = $http
    this.scope = $scope
    this.sce = $sce
    this.state = $state
    this.ngToast = ngToast
    this.localStorageService = LocalStorageService


    $scope.$on('$ionicView.enter', (e) => {

      if(AuthService.isLoggedIn()){
        this.notification = this.localStorageService.getObject('notification')
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> Notification 需要會員權限，請先登入！</i>`)
        $state.go("tab.account")
      }

    })

  }


}
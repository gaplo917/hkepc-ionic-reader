/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/FindMessageRequest"
import {NotificationBadgeUpdateRequest} from "../model/NotificationBadgeUpdateRequest"
import {ChangeThemeRequest} from "../model/ChangeThemeRequest"
import {ChangeFontSizeRequest} from "../model/ChangeFontSizeRequest"

const cheerio = require('cheerio')

export class FeatureRouteController{
  static get STATE() { return 'tab.features'}
  static get NAME() { return 'FeatureRouteController'}
  static get CONFIG() { return {
    url: '/features',
    views: {
      'tab-features': {
        templateUrl: 'templates/features/features.route.html',
        controller: FeatureRouteController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,$rootScope, $http, AuthService,$state,$sce,ngToast,LocalStorageService){

    this.http = $http
    this.scope = $scope
    this.rootScope = $rootScope
    this.sce = $sce
    this.state = $state
    this.ngToast = ngToast
    this.localStorageService = LocalStorageService
    this.darkTheme = this.localStorageService.get('theme') == 'dark'
    this.fontSize = this.localStorageService.get('fontSize') || "100"

    this.cleanBadgeUpdateListener = $rootScope.$on(NotificationBadgeUpdateRequest.NAME,(e,req) => {
      if(req instanceof NotificationBadgeUpdateRequest) {
        console.debug(`[${FeatureRouteController.NAME}] Received NotificationBadgeUpdateRequest`)

        console.log(req.notification)
        this.notification = req.notification
      }
    })

    $scope.$on('$ionicView.enter', (e) => {

      this.notification = this.localStorageService.getObject('notification')

    })
  }

  onDarkTheme(bool){
    const theme = bool? 'dark' : 'default'
    this.scope.$emit(ChangeThemeRequest.NAME, new ChangeThemeRequest(theme))
  }

  onResizeFont(size) {
    this.scope.$emit(ChangeFontSizeRequest.NAME, new ChangeFontSizeRequest(size))
  }

}
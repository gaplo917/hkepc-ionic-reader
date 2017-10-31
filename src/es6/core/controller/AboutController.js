/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {Bridge, Channel} from "../bridge/index";

export class AboutController {
  static get STATE() { return 'tab.about'}
  static get NAME() { return 'AboutController'}
  static get CONFIG() { return {
    url: '/about',
    cache: false,
    views: {
      'main': {
        templateUrl: 'templates/tab-about.html',
        controller: AboutController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope, $http, LocalStorageService,$ionicPopup, ngToast) {

    this.localStorageService = LocalStorageService
    this.http = $http
    this.scope = $scope
    this.ionicPopup = $ionicPopup
    this.version = HKEPC.version
    this.ngToast = ngToast

    LocalStorageService.get('proxy').safeApply($scope, data => {
      this.proxy = data || HKEPC.proxy
    }).subscribe()
  }

  isIOS(){
    return ionic.Platform.isIOS()
  }

  isAndroid(){
    return ionic.Platform.isAndroid()
  }

  showProxyPopup(){

    // An elaborate, custom popup
    const proxyPopup = this.ionicPopup.show({
      template: '<input type="text" ng-model="vm.proxy">',
      title: 'Enter Proxy Server',
      subTitle: 'Please make sure it is work!',
      scope: this.scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: (e) => {
            if (!this.proxy) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return this.proxy;
            }
          }
        }
      ]
    })

    proxyPopup.then((res) => {
      if(res){
        this.localStorageService.set('proxy',res)
      }
    })
  };

  isProxy() {
    return URLUtils.isProxy()
  }

  onIAP(){
    if(Bridge.isAvailable()){
      Bridge.callHandler(Channel.iap)
    }
    else {
      this.ngToast.info(`<i class="ion-ios-timer-outline">請使用 iOS 或 Android App 訂閱</i>`)
    }

  }
}
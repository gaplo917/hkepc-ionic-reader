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

  isPromote() {
    const today = moment()
    const promoteEnd = moment('2019-10-31')
    return promoteEnd.diff(today) >= 0
  }
}

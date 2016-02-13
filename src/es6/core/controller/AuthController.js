/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'

export class AuthController {
  static get STATE() { return 'tab.account'}
  static get NAME() { return 'AuthController'}
  static get CONFIG() { return {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: AuthController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope, $http, LocalStorageService, AuthService,$ionicPopup) {

    this.localStorageService = LocalStorageService
    this.http = $http
    this.scope = $scope
    this.authService = AuthService
    this.ionicPopup = $ionicPopup
    this.version = HKEPC.version
    this.proxy = LocalStorageService.get('proxy') || HKEPC.proxy

    this.user = LocalStorageService.getObject('authority')

  }

  login(username,password){

    const authority = {
      username: username,
      password: password
    }

    this.authService.login(authority,(err,username) => {
      this.authService.saveAuthority(authority)
      this.scope.$emit("accountTabUpdate",username)

      // unset the password field
      this.user.password = undefined
    })

  }

  isLoggedIn(){
    return this.authService.isLoggedIn()
  }

  logout(){
    this.authService.logout()

    // send the login name to parent controller
    this.scope.$emit("accountTabUpdate")
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
    return !URLUtils.isFileSys()
  }
}
/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"

export class AuthController {

  constructor($scope, $http, $localstorage, authService,$ionicPopup) {

    this.localstorage = $localstorage
    this.http = $http
    this.scope = $scope
    this.authService = authService
    this.ionicPopup = $ionicPopup
    this.localstorage = $localstorage

    this.version = HKEPC.version
    this.proxy = $localstorage.get('proxy') || HKEPC.proxy

    this.user = $localstorage.getObject('authority')

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
        this.localstorage.set('proxy',res)
      }
    })
  };
}
/**
 * Created by Gaplo917 on 30/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"

export class FindMessageController {

  constructor($scope, $http, $localstorage, authService) {

    this.localstorage = $localstorage
    this.http = $http
    this.scope = $scope
    this.authService = authService

    $scope.user = $localstorage.getObject('authority')

  }

  login(username,password){

    const authority = {
      username: username,
      password: password
    }

    this.authService.login(authority,(err,username) => {
      this.authService.saveAuthority(authority)

      this.scope.$emit("accountTabUpdate",username)
    })

  }

  isLoggedIn(){
    return this.authService.isLoggedIn()
  }

  logout(){
    this.authService.logout()
  }
}
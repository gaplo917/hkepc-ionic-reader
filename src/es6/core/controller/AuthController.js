/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"

export class AuthController {

  constructor($scope, $http, $localstorage, authService) {

    this.localstorage = $localstorage
    this.http = $http
    this.scope = $scope
    this.authService = authService

    $scope.user = $localstorage.getObject('authority')

    $scope.login = (username, password) => {
      "use strict";
      this.login(username,password)
    }

  }

  login(username,password){

    const authority = {
      username: username,
      password: password
    }

    this.authService.saveAuthority(authority)

    this.authService.login(authority,(err,username) => {
      this.scope.$emit("accountTabUpdate",username)

      // alert the user login success
      alert(`登入成功 ${username}`)
    })

  }
}
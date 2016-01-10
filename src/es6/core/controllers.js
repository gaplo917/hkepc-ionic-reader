import * as cheerio from "cheerio"
import * as HKEPC from "../data/config/hkepc"
import * as URLUtils from "../utils/url"
import * as Controllers from './controller/index'

/**
 * Register the controllers
 */
angular.module('starter.controllers', [])

.controller(Controllers.topics.name, Controllers.topics.action)

.controller(Controllers.posts.name, Controllers.posts.action)

.controller(Controllers.post.name,Controllers.post.action)

.controller(Controllers.replyPost.name,Controllers.replyPost.action)


    .controller('ChatsCtrl', ($scope, Chats) => {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //})

  $scope.chats = Chats.all()
  $scope.remove = function(chat) {
    Chats.remove(chat)
  }
})

.controller('ChatDetailCtrl', ($scope, $stateParams, Chats) => {
  $scope.chat = Chats.get($stateParams.chatId)
})

.controller('AccountCtrl', ($scope,$http,$localstorage) => {

  $scope.user = $localstorage.getObject("user")

  $scope.login = (username,password) => {
    "use strict";

    $localstorage.setObject("user",{
      username: username,
      password: password
    })

    $http({
      method: "POST",
      url : HKEPC.forum.login,
      data:`username=${username}&password=${password}&cookietime=2592000`,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then((resp) => {
      alert(resp.data)
    },(err) => {
      alert(err)
    })
  }
})

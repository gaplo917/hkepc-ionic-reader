/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
import * as Controllers from "./index"

const cheerio = require('cheerio')

export class ChatController{
  static get STATE() { return 'tab.features-chats'}
  static get NAME() { return 'ChatController'}
  static get CONFIG() { return {
    url: '/features/chats',
    views: {
      'tab-features': {
        templateUrl: 'templates/features/chats/chats.list.html',
        controller: ChatController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, apiService, AuthService,$state,ngToast,$ionicHistory,rx){

    this.apiService = apiService
    this.scope = $scope
    this.chats = []
    this.state = $state
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory
    this.rx = rx

    this.page = 1

    $scope.$on('$ionicView.loaded', (e) => {

      this.rx.Observable.combineLatest(
        AuthService.isLoggedIn(),
        AuthService.getUsername(),
        (isLoggedIn, username) => {
          return {
            isLoggedIn: isLoggedIn,
            username: username
          }
        }
      ).safeApply($scope,({isLoggedIn, username}) => {
        if (isLoggedIn) {
          this.scope.$emit("accountTabUpdate",username)
          this.loadChats()
        } else {
          this.ngToast.danger(`<i class="ion-alert-circled"> 私人訊息需要會員權限，請先登入！</i>`)
          $state.go(Controllers.AccountController.STATE)
        }
      }).subscribe()

    })
  }

  loadChats(){
    this.apiService.chatList(this.page)
        .safeApply(this.scope, (resp) => {

          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseForumUrl)
              .getCheerio()

          const pageNumSource = $('.pages a, .pages strong')

          const pageNumArr = pageNumSource
              .map((i,elem) => $(elem).text())
              .get()
              .map(e => e.match(/\d/g)) // array of string with digit
              .filter(e => e != null) // filter null value
              .map(e => parseInt(e.join(''))) // join the array and parseInt

          this.totalPageNum = pageNumArr.length == 0
              ? 1
              : Math.max(...pageNumArr)

          console.log("totalPageNum",this.totalPageNum)

          const chats = $('.pm_list li').map((i, elem) => {
            let chatSource = cheerio.load($(elem).html())


            const avatarUrl = chatSource('.avatar img').attr('src')
            const summary = chatSource('.summary').text()
            const username = chatSource('.cite cite a').text()
            const isRead = chatSource('.cite img').attr('alt') != 'NEW'

            chatSource('cite').remove()
            const date = chatSource('.cite').text()

            const id = URLUtils.getQueryVariable(avatarUrl,'uid')
            return {
              id: id,
              avatarUrl:avatarUrl,
              summary:summary,
              username: username,
              date : date,
              isRead: isRead
            }

          }).get()


          this.chats = this.chats.concat(chats)

          this.scope.$broadcast('scroll.infiniteScrollComplete')

        })
        .subscribe()
  }

  loadMore(cb){
    if(this.hasMoreData()){
      const nextPage = parseInt(this.page) + 1
      //update the page count
      this.page = parseInt(this.page) + 1

      this.loadChats(cb)
    }

  }

  hasMoreData(){
    return this.page < this.totalPageNum
  }

  doRefresh(){
    this.chats = []
    this.page = 1
    this.loadChats()
  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && history.backView.stateName == Controllers.FeatureRouteController.STATE){
      this.ionicHistory.goBack()
    } else {
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }
}
/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
const cheerio = require('cheerio')
const async = require('async')

export class ChatController{
  static get STATE() { return 'tab.chats'}
  static get NAME() { return 'ChatController'}
  static get CONFIG() { return {
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: ChatController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, $http, AuthService,$state,ngToast){

    this.http = $http
    this.scope = $scope
    this.chats = []
    this.ngToast = ngToast
    this.page = 1

    $scope.$on('$ionicView.loaded', (e) => {
      if(AuthService.isLoggedIn()){
        this.scope.$emit("accountTabUpdate",AuthService.getUsername())
        this.loadChats()
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> PM 需要會員權限，請先登入！</i>`)
        $state.go("tab.account")
      }

    })
  }

  loadChats(){
    this.http
        .get(HKEPC.forum.pmList(this.page))
        .then((resp) => {

          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseUrl)
              .getCheerio()

          // select the current login user
          const currentUsername = $('#umenu > cite').text()

          // send the login name to parent controller
          this.scope.$emit("accountTabUpdate",currentUsername)

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

            chatSource('cite').remove()
            const date = chatSource('.cite').text()

            const id = URLUtils.getQueryVariable(avatarUrl,'uid')
            return {
              id: id,
              avatarUrl:avatarUrl,
              summary:summary,
              username: username,
              date : date
            }

          }).get()


          this.chats = this.chats.concat(chats)

          this.scope.$broadcast('scroll.infiniteScrollComplete')

        },(err) => {
          console.log(err)
        })
  }

  loadMore(cb){
    console.log("loadmore",this.page)
    if(this.hasMoreData()){
      const nextPage = parseInt(this.page) + 1
      //update the page count
      this.page = parseInt(this.page) + 1

      this.loadChats(cb)
    }

  }

  hasMoreData(){
    console.log("hasMoreData",this.page)

    return this.page < this.totalPageNum
  }

  doRefresh(){
    this.chats = []
    this.page = 1
    this.loadChats()
  }
}
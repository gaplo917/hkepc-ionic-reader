/**
 * Created by Gaplo917 on 6/3/2016.
 */
import * as Controllers from "./index"
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/FindMessageRequest"

const cheerio = require('cheerio')
const moment = require('moment')
require('moment/locale/zh-tw');

export class MyReplyController {
  static get STATE() { return 'tab.features-myreply' }

  static get NAME() { return 'MyReplyController' }

  static get CONFIG() {
    return {
      url: '/features/myreply',
      views: {
        'tab-features': {
          templateUrl: 'templates/features/myreply/my.reply.html',
          controller: MyReplyController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor(HistoryService,$ionicHistory,$state,$scope,$ionicPopover,$http,$sce,AuthService,ngToast) {
    this.historyService = HistoryService
    this.state = $state
    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.http = $http
    this.sce = $sce
    this.ngToast = ngToast

    this.page = 1
    this.myreplies = []

    $ionicPopover.fromTemplateUrl('templates/modals/page-slider.html', {
      scope: $scope
    }).then((popover) => {
      this.pageSliderPopover = popover
    })

    $scope.$on('$destroy', () => {
      this.pageSliderPopover.remove()
    })

    $scope.$on('$ionicView.loaded', (e) => {
      if(AuthService.isLoggedIn()){
        this.loadMyReplies()
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 我的回覆需要會員權限，請先登入！</i>`)
        $state.go(Controllers.AccountController.STATE)
      }
    })


  }

  loadMyReplies(){

    this.refreshing = true

    this.http.get(`http://www.hkepc.com/forum/my.php?item=posts&page=${this.page}`).then(resp => {

      const html = new HKEPCHtml(cheerio.load(resp.data))

      const $ = html.processImgUrl(HKEPC.imageUrl)
          .processEpcUrl()
          .processExternalUrl()
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

      const myreplies = $('.datalist > table > tbody > tr').map((i,elem) => {
        const postSource = cheerio.load($(elem).html())

        return {
          post:{
            title:postSource('th a').text(),
            messageId: postSource('th a').attr('pid'),
            postId:  postSource('th a').attr('ptid'),
            inAppUrl: postSource('th a').attr('in-app-url')
          },
          topic: {
            url : postSource('.forum a').attr('href'),
            title:  postSource('.forum a').text()
          },
          status: postSource('.nums').text(),
          timestamp: postSource('.lastpost > em > span').attr('title')|| postSource('.lastpost > em').text() || 0,
          brief: postSource('.lighttxt').text()
        }

      }).get()

      console.log(myreplies)
      // merge array
      for(let i = 0 ; i < myreplies.length ; i += 2 ) {
        myreplies[i].brief = myreplies[i+1].brief
      }

      const mergedMyReplies = myreplies.filter(x => x.timestamp != 0)

      this.myreplies  = this.myreplies.concat(mergedMyReplies)

      this.refreshing = false
      this.scope.$broadcast('scroll.infiniteScrollComplete')

    })
  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && history.backView.stateName == Controllers.FeatureRouteController.STATE){
      this.ionicHistory.goBack()
    } else {
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }

  reset(){
    this.myreplies = []
    this.end = false;

  }

  openPageSliderPopover($event) {
    this.inputPage = this.page
    this.pageSliderPopover.show($event)
  }

  doJumpPage(){
    this.pageSliderPopover.hide()
    this.reset()
    this.page = this.inputPage
    this.loadMyReplies()
  }

  findMessage(postId,messageId){
    this.scope.$emit(FindMessageRequest.NAME,new FindMessageRequest(postId,messageId))
  }

  loadMore(){
    if(this.hasMoreData()){
      const nextPage = parseInt(this.page) + 1
      if(nextPage <= this.totalPageNum){
        //update the page count
        this.page = parseInt(this.page) + 1

        this.loadMyReplies()
      }
      else{
        // set a flag for end
        this.end = true
      }

    }

  }

  hasMoreData(){
    return !this.end && !this.refreshing
  }
}
/**
 * Created by Gaplo917 on 6/3/2016.
 */
import * as Controllers from "./index"
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"

const cheerio = require('cheerio')

export class MyPostController {
  static get STATE() { return 'tab.features-mypost' }

  static get NAME() { return 'MyPostController' }

  static get CONFIG() {
    return {
      url: '/features/mypost',
      views: {
        'tab-features': {
          templateUrl: 'templates/features/mypost/my.post.html',
          controller: MyPostController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor(HistoryService,$ionicHistory,$state,$scope,$ionicPopover,apiService,AuthService,ngToast) {
    this.historyService = HistoryService
    this.state = $state
    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.apiService = apiService
    this.ngToast = ngToast

    this.page = 1
    this.myposts = []

    $ionicPopover.fromTemplateUrl('templates/modals/page-slider.html', {
      scope: $scope
    }).then((popover) => {
      this.pageSliderPopover = popover
    })

    $scope.$on('$destroy', () => {
      this.pageSliderPopover.remove()
    })

    $scope.$on('$ionicView.loaded', (e) => {
      AuthService.isLoggedIn().safeApply($scope, isLoggedIn => {
        if (isLoggedIn) {
          this.loadMyPosts()
        } else {
          this.ngToast.danger(`<i class="ion-alert-circled"> 我的帖子需要會員權限，請先登入！</i>`)
          $state.go(Controllers.AccountController.STATE)
        }
      }).subscribe()
    })


  }

  loadMyPosts(){

    this.refeshing = true

    this.apiService.myPosts(this.page)
      .safeApply(this.scope, resp => {

      const html = new HKEPCHtml(cheerio.load(resp.data))

      const $ = html.processImgUrl(HKEPC.imageUrl)
          .processEpcUrl(window.location.hash)
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

      const myposts = $('.datalist > table > tbody > tr').map((i,elem) => {
        const postSource = cheerio.load($(elem).html())

        return {
          post:{
            title:postSource('th a').text(),
            url: postSource('th a').attr('href')
          },
          topic: {
            url : postSource('.forum a').attr('href'),
            title:  postSource('.forum a').text()
          },
          status: postSource('.nums').text(),
          lastpost:{
            by : postSource('.lastpost cite a').text(),
            timestamp: postSource('.lastpost > em > a > span').attr('title') || postSource('.lastpost > em > a').text() || 0,
          }

        }

      }).get()


      this.myposts = this.myposts.concat(myposts)

      this.refeshing = false
      this.scope.$broadcast('scroll.infiniteScrollComplete')
    }).subscribe()
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
    this.myposts = []
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
    this.loadMyPosts()
  }

  loadMore(){
    if(this.hasMoreData()){
      const nextPage = parseInt(this.page) + 1
      if(nextPage <= this.totalPageNum){
        //update the page count
        this.page = parseInt(this.page) + 1

        this.loadMyPosts()
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
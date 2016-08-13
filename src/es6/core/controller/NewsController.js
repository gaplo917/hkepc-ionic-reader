/**
 * Created by Gaplo917 on 13/8/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
import * as Controllers from "./index"

const cheerio = require('cheerio')
const Rx = require('rx')
const moment = require('moment')
require('moment/locale/zh-tw');

export class NewsController{
  static get STATE() { return 'tab.topics-news'}
  static get NAME() { return 'NewsController'}
  static get CONFIG() { return {
    url: '/topics/news',
    cache: false,
    views: {
      'tab-topics': {
        templateUrl: 'templates/news.html',
        controller: NewsController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, $http,$ionicHistory,ngToast,MessageService,$sanitize,$ionicActionSheet,$state){

    this.http = $http
    this.scope = $scope
    this.chats = []
    this.ngToast = ngToast
    this.pageSize = 5
    this.sanitize = $sanitize
    this.end = false
    this.page = 1
    this.ionicActionSheet = $ionicActionSheet
    this.messageService = MessageService
    this.delayRender = 100
    this.searchText = ''
    this.ionicHistory = $ionicHistory
    this.state = $state

    $scope.$on('$ionicView.enter', (e) => {
      this.messages = []
    })

    this.loadNews()
  }


  loadNews(){
    this.refreshing = true

    const source = Rx.Observable
        .fromPromise(this.http.get(HKEPC.forum.news(this.page)))
        .map(resp => new HKEPCHtml(cheerio.load(resp.data)))
        .map(
            html => html.processImgUrl(HKEPC.imageUrl)
                .processEpcUrl()
                .processExternalUrl()
        )

    // render the basic information first
    source.subscribe(
        html => this.page += 1,
        err => console.log(err)
    )

    const postTasks = source
        .flatMap(html => {
          const $ = html.getCheerio()
          return $('#items .item').map((i, elem) => { return {$: $, elem: elem} }).get()
        })
        .map(postObj => Rx.Observable.return(postObj).delay(this.delayRender))
        .concatAll()

    // render the post
    this.postTaskSubscription = postTasks
        .subscribe(
            postObj => {

              const elem = postObj.elem,
                    $ = postObj.$

              let postSource = cheerio.load($(elem).html())


              const title = postSource('.header .heading').text()
              const url = postSource('.introduction > a').attr('data-href')
              const imgUrl = postSource('.introduction > a > img').attr('src')
              const tags = postSource('.content .tags a').map((i,elem) => postSource(elem).text()).get()
              const date = postSource('.date').text()
              const authorName = postSource('.author').text().replace('文: ','')

              postSource('.tags, .introduction > a').remove()
              const contentSource = postSource('.content .introduction')

              const excerpt = contentSource.text().substring(0,100) + `... <a ng-click="message.isExcerpt = false">繼續閱讀</a>`
              const content = contentSource.html()

              const viewCount = postSource('.count').text().match(/\d/g).join('')
              const commentCount = postSource('.fb_comments_count').text()

              console.log(viewCount)
              console.log(commentCount)

              this.messages.push({
                author: {
                  image: "",
                  name: authorName,
                },
                count: {
                  view: viewCount,
                  comment: commentCount
                },
                createdAt: date,
                title: title,
                url: url,
                image: imgUrl,
                tags: tags,
                excerpt: excerpt,
                content: content
              })

              this.scope.$apply()
            },
            err => console.trace(err),
            () => {
              console.debug("All Render Task Completed")

              if(this.focus){
                console.debug('detected focus object')
                setTimeout(() => {
                  const focusPosition = angular.element(document.querySelector(`#message-${this.focus}`)).prop('offsetTop')
                  this.ionicScrollDelegate.scrollTo(0,focusPosition)
                  this.focus = undefined
                },200)
              }

              this.refreshing = false
              this.scope.$apply()
              this.scope.$broadcast('scroll.infiniteScrollComplete')
            }
        )

  }

  goToPost(url, hashTag = "") {
    window.open(url + hashTag, '_system', 'location=yes');
    return false;
  }

  loadMore(){
    console.log("loadmore",this.totalPageNum)
    if(this.hasMoreData() && !this.refreshing){

      this.loadNews()

      this.scope.$broadcast('scroll.infiniteScrollComplete')
    }

  }

  hasMoreData(){
    return true
  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    console.log(history)
    if(history.backView && (history.backView.stateName == Controllers.TopicListController.STATE || history.backView.stateName == Controllers.NewsController.STATE) &&
        history.backView.stateParams.postId != history.currentView.stateParams.postId){

      this.ionicHistory.goBack()

    } else {
      this.state.go(Controllers.TopicListController.STATE)
    }
  }

}

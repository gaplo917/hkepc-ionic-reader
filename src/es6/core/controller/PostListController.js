/**
 * Created by Gaplo917 on 11/1/2016.
 */
import {PushHistoryRequest} from '../model/PushHistoryRequest'
import {PostListRefreshRequest} from '../model/PostListRefreshRequest'
import * as Controllers from './index'


export class PostListController {
  static get STATE() { return 'tab.topics-posts'}
  static get NAME() { return 'PostListController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/page/:page?searchId=&searchText=&searchResp=',
    views: {
      'tab-topics': {
        templateUrl: 'templates/post-list.html',
        controller: PostListController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope,$state,$stateParams,$location,$ionicScrollDelegate,$ionicHistory,$ionicPopover,LocalStorageService,$ionicModal,ngToast,$q, apiService, rx, $rootScope) {
    this.scope = $scope
    this.state = $state
    this.location = $location
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.ionicHistory = $ionicHistory
    this.localStorageService = LocalStorageService
    this.ngToast = ngToast
    this.q = $q
    this.apiService = apiService
    this.rx = rx
    this.$ionicModal = $ionicModal
    this.$ionicPopover = $ionicPopover

    this.topicId = $stateParams.topicId
    this.searchId = $stateParams.searchId
    this.searchText = $stateParams.searchText
    // passed from SearchController
    this.searchResp = $stateParams.searchResp ? JSON.parse($stateParams.searchResp) : undefined

    this.page = $stateParams.page
    this.categories = []
    this.currentPageNum = this.page - 1
    this.pointingPage = this.currentPageNum
    this.subTopicList = []
    this.posts = []
    this.hasMoreData = true

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/sub-forums.html', {
      scope: $scope
    }).then((popover) => {
      this.subTopicListPopover = popover
    })

    $ionicPopover.fromTemplateUrl('templates/modals/filter-order.html', {
      scope: $scope
    }).then((popover) => {
      this.filterOrderPopover = popover
    })

    $scope.openPopover = ($event) => {
      if(this.subTopicList && this.subTopicList.length > 0){
        this.subTopicListPopover.show($event)
      }
    }

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.filterOrderPopover && this.filterOrderPopover.remove()
      this.subTopicListPopover && this.subTopicListPopover.remove()
    })

    $scope.$eventToObservable('lastread')
      .throttle(300)
      .safeApply($scope, ([event,{ page, id }]) => {
        console.log("received broadcast lastread",page, id)
        this.pointingPage = page
      })
      .subscribe()

    $scope.$on('$ionicView.loaded', (e) => {
      this.localStorageService.get('showSticky',true).safeApply($scope, data => {
        console.log("showSticky",data)
        this.showSticky = String(data) === 'true'
      }).subscribe()

      this.filter = undefined
      this.order = undefined

      this.loadMore()

    })

    $scope.$on('$ionicView.enter', (e) => {

    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
    })

    $rootScope.$eventToObservable(PostListRefreshRequest.NAME)
      .subscribe(() => {
        this.doRefresh()
      })
  }

  loadMore(cb){
    if(this.hasMoreData){
      const nextPage = parseInt(this.currentPageNum) + 1

      if(this.searchResp){
        this.renderPostListResponse(this.searchResp)
        this.searchResp = undefined
      }
      else {
        this.apiService.postListPage({
          topicId: this.topicId,
          pageNum: nextPage,
          filter : this.filter,
          order: this.order,
          searchId: this.searchId
        })
          .safeApply(this.scope, resp => {
            this.renderPostListResponse(resp)
          }).subscribe()
      }
    }
  }

  renderPostListResponse(resp){
    this.searchId = resp.searchId
    // only extract the number
    this.totalPageNum = resp.totalPageNum

    // use exiting list if there is
    this.subTopicList =  this.subTopicList.length === 0
      ? resp.subTopicList
      : this.subTopicList

    this.categories = resp.categories

    // better UX to highlight the searchText
    this.posts = this.topicId === 'search'
      ? this.posts.concat(this.highlightSearchText(resp.posts, this.searchText))
      : this.posts.concat(resp.posts)

    this.currentPageNum = parseInt(this.currentPageNum) + 1

    this.topic = {
      id: this.topicId,
      name: this.topicId === 'search'
        ? `${resp.topicName} ${this.searchText}`
        : this.topicId === 'latest'
          ? '最新帖子'
          : resp.topicName
    }

    this.hasMoreData = this.currentPageNum < this.totalPageNum

    this.scope.$broadcast('scroll.infiniteScrollComplete')
  }

  reset(){
    this.currentPageNum = 0
    this.posts = []

  }

  doRefresh(){
    this.reset()
    if(this.filter) {
      const category = this.categories.find(c => c.id === this.filter)
      if(category){
        this.ngToast.success(`<i class="ion-ios-checkmark-outline"> 正在使用分類 - #${category.name} </i>`)
      }
    }
    this.loadMore()
  }

  goToSubTopic(index,subTopic){
    this.subTopicListPopover.hide();

    // swap the item in the list
    this.subTopicList[index] = this.topic
    this.topic = subTopic

    // override the topic id
    this.topicId = subTopic.id

    this.doRefresh()
  }


  saveShowSticky(bool) {
    this.localStorageService.set('showSticky',bool)
  }

  doNewPost(topic){

    this.state.go(Controllers.WriteNewPostController.STATE, {
      topicId: this.topicId,
      topic: JSON.stringify(topic),
      categories: JSON.stringify(this.categories)
    })
  }

  doFilterOrder($event){
    this.filterOrderPopover.show($event)
  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true

      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }

  onGoToPost(post){
    this.scope.$emit(PushHistoryRequest.NAME, new PushHistoryRequest(post))
  }

  hasStickyPost(posts) {
    return posts && posts.filter(post => post.isSticky).length > 0
  }

  relativeMomentize(dateStr){
    if(moment(dateStr, 'YYYY-M-D hh:mm').diff(new Date(),'days') >= -3 ){
      return moment(dateStr, 'YYYY-M-D hh:mm').fromNow()
    } else {
      return dateStr
    }
  }

  swipeLeft(){
    this.onBack()
  }

  /**
   *  Modified version from LikesController
   */
  highlightSearchText(posts, searchText){
    const searchKeywordIndex = (str,keyword,indexArr = []) => {
      const lastIndexPos = indexArr.length === 0 ? 0 : indexArr[indexArr.length - 1] + 1
      const index = str.indexOf(keyword,lastIndexPos)
      if(index === -1 || !str || !keyword){
        return indexArr
      } else {
        return searchKeywordIndex(str,keyword,indexArr.concat([index]))
      }
    }

    const searchBraceIndex = (str,indexArr = []) => {
      return (searchKeywordIndex(str,'<').concat(searchKeywordIndex(str,'>'))).sort((a,b) => a - b)
    }

    const isIndexInBrace = (content,bracePos,index) => {
      switch (bracePos.length){
        case 0 :
          return false
        case 1 :
          return false
        default :
          return (
              content[bracePos[0]] === '<'
              && content[bracePos[1]] === '>'
              && index > bracePos[0]
              && index < bracePos[1]
            ) || isIndexInBrace(content,bracePos.slice(2),index)
      }
    }

    const breakContent = (content,len, validIndexs,prevPos = 0,splits = []) => {
      switch(validIndexs.length){
        case 0:
          // concat the rest of the content
          return splits.concat([
            content.slice(Math.min(prevPos,content.length)),
          ])
        default:
          const contentIndex = validIndexs[0]
          // break down into two part
          const s = splits.concat([
            content.slice(prevPos ,contentIndex),
            content.slice(contentIndex,contentIndex + len),
          ])
          return breakContent(content,len,validIndexs.slice(1),contentIndex + len ,s)
      }
    }

    const mergeAndInjectHightLightContent = (splits,hlContent = '') => {
      switch (splits.length) {
        case 0 :
          return hlContent
        case 1 :
          return `${hlContent}${splits[0]}`
        default :
          const merged = `${hlContent}${splits[0]}<span class="search-highlight">${splits[1]}</span>`
          return mergeAndInjectHightLightContent(splits.slice(2),merged)
      }
    }

    const searchAndInjectHighlightBetweenKeyword = (content,keyword) => {
      // find all brace for identify the html tag
      const bracePos = searchBraceIndex(content)

      // search the keyword position
      const validIndex = searchKeywordIndex(content.toLowerCase(),keyword.toLowerCase())
        .filter(index => !isIndexInBrace(content,bracePos,index))

      return {
        matches : validIndex.length,
        hlContent : mergeAndInjectHightLightContent(breakContent(content,keyword.length,validIndex))
      }
    }

    const searchMultipleKeyword = (keywordArr, post, result = { matches: 0 }) => {
      switch (keywordArr.length) {
        case 0 :
          return result
        default :
          const hlm = Object.assign({},post)

          const title = angular.element('<div/>').html(hlm.name).html()
          const keyword = keywordArr[0]

          const searchResult = {
            name: searchAndInjectHighlightBetweenKeyword(title,keyword)
          }

          // set the name
          hlm.name = searchResult.name.hlContent

          result = {
            matches : result.matches + searchResult.name.matches,
            post: hlm
          }

          return searchMultipleKeyword(keywordArr.slice(1),hlm,result)
      }
    }

    return posts.map(post => {
      // map to a search result
      return searchMultipleKeyword(searchText.split(' '),post)
    }).map(e => e.post)

  }
}

/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
import {CommonInfoExtractRequest} from '../model/CommonInfoExtractRequest'
import {PushHistoryRequest} from '../model/PushHistoryRequest'
import * as Controllers from './index'

const cheerio = require('cheerio')

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
  constructor($scope,$http,$state,$stateParams,$location,$ionicScrollDelegate,$ionicSlideBoxDelegate,$ionicHistory,$ionicPopover,LocalStorageService,$ionicModal,ngToast,$q, apiService, rx) {
    this.scope = $scope
    this.http = $http
    this.state = $state
    this.location = $location
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.ionicHistory = $ionicHistory
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.localStorageService = LocalStorageService
    this.ngToast = ngToast
    this.q = $q
    this.apiService = apiService
    this.rx = rx

    this.topicId = $stateParams.topicId
    this.searchId = $stateParams.searchId
    this.searchText = $stateParams.searchText
    // passed from SearchController
    this.searchResp = $stateParams.searchResp ? JSON.parse($stateParams.searchResp) : undefined

    this.page = $stateParams.page
    this.categories = []
    this.currentPageNum = this.page - 1
    this.pointingPage = this.currentPageNum
    this.newPostModal = {}
    this.subTopicList = []
    this.posts = []
    this.hasMoreData = true

    const newPostModal = this.scope.newPostModal = $scope.$new()
    newPostModal.id = "new-content"
    newPostModal.post = {}

    newPostModal.hide = () => this.newPostModal.hide()
    newPostModal.show = () => {
      console.log(this.categories)
      newPostModal.categories = this.categories
      this.newPostModal.show()
    }
    newPostModal.openCategoryPopover = ($event) => {
      newPostModal.categoryPopover.show($event)
    }

    newPostModal.selectCategory = (category) => {
      newPostModal.categoryPopover.hide()
      newPostModal.post.category = category
    }

    newPostModal.initialize = (topic) => {
      newPostModal.topic = topic

      this.http.get(HKEPC.forum.newPost(this.topicId))
        .then(resp => {
          let $ = cheerio.load(resp.data)

          const relativeUrl = $('#postform').attr('action')
          const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

// ---------- Upload image preparation ----------------------------------------------
          let imgattachform = $('#imgattachform')
          let attachFormSource = cheerio.load(imgattachform.html())

          const hiddenAttachFormInputs = {}

          hiddenAttachFormInputs['action'] = `${HKEPC.baseForumUrl}/${imgattachform.attr('action')}`

          attachFormSource(`input[type='hidden']`).map((i,elem) => {
            const k = attachFormSource(elem).attr('name')
            const v = attachFormSource(elem).attr('value')

            return hiddenAttachFormInputs[k] = encodeURIComponent(v)
          }).get()

          // assign hiddenAttachFormInputs to modal
          newPostModal.hiddenAttachFormInputs = hiddenAttachFormInputs
          newPostModal.images = []

          newPostModal.onImageUpload = (image) => {
            console.log("onImageUplod",image)
            newPostModal.images.push(image)
          }

// ---------- End of Upload image preparation -----------------------------------------------

          newPostModal.doPublishNewPost = (post) => {
            console.log('do publist new post')

            const isValidInput = post.title && post.content
            const hasChoosenPostType =
                    (post.category.id && newPostModal.categories.length > 0) ||
                    newPostModal.categories.length == 0

            if(isValidInput && hasChoosenPostType){

              const hiddenFormInputs = $(`input[type='hidden']`).map((i,elem) => {
                const k = $(elem).attr('name')
                const v = $(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()

              console.log(hiddenFormInputs)

              const ionicReaderSign = HKEPC.signature()

              const subject = post.title
              const replyMessage = `${post.content}\n\n${ionicReaderSign}`
              const undefinedFilter = /.*=undefined$/i
              const postData = [
                `subject=${encodeURIComponent(subject)}`,
                `message=${encodeURIComponent(replyMessage)}`,
                `typeid=${post.category.id}`,
                `handlekey=newthread`,
                `topicsubmit=true`,
                hiddenFormInputs.join('&'),
                newPostModal.images.map(_ => _.formData).join('&')
              ].filter(e => !undefinedFilter.test(e))
                .join('&')

              //Post to the server
              this.http({
                method: "POST",
                url : postUrl,
                data : postData,
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              }).then((resp) => {

                this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈主題！</i>`)

                newPostModal.hide()

                this.doRefresh()

              })

            } else if(hasChoosenPostType) {
              this.ngToast.danger(`<i class="ion-alert-circled"> 標題或內容不能空白！</i>`)
            } else {
              this.ngToast.danger(`<i class="ion-alert-circled"> 必須選擇新帖分類！</i>`)
            }
          }


        })
    }


    $ionicModal.fromTemplateUrl('templates/modals/new-post.html', {
      scope: newPostModal
    }).then((modal) => {
      this.newPostModal = modal

      $ionicPopover.fromTemplateUrl('templates/modals/categories.html', {
        scope: newPostModal
      }).then((popover) => {
        newPostModal.categoryPopover = popover;
      })

    })

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
      this.subTopicListPopover.remove()
      this.newPostModal.remove()
    })

    $scope.$eventToObservable('lastread')
      .throttle(300)
      .safeApply($scope, ([event,{ page, id }]) => {
        console.log("received broadcast lastread",page, id)
        this.pointingPage = page
      })
      .subscribe()

    $scope.$on('$ionicView.loaded', (e) => {

      this.filter = undefined
      this.order = undefined

      this.loadMore()

    })

    $scope.$on('$ionicView.enter', (e) => {
      console.log("enter PostListController")
      // stringify and compare to string value
      this.localStorageService.get('showSticky',true).subscribe(data => {
        console.log("showSticky",data)
        this.showSticky = String(data) == 'true'
      })

    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
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
    this.subTopicList =  this.subTopicList.length == 0
      ? resp.subTopicList
      : this.subTopicList

    this.categories = resp.categories

    // better UX to highlight the searchText
    this.posts = this.topicId == 'search'
      ? this.posts.concat(this.highlightSearchText(resp.posts, this.searchText))
      : this.posts.concat(resp.posts)

    this.currentPageNum = parseInt(this.currentPageNum) + 1

    this.topic = {
      id: this.topicId,
      name: this.topicId == 'search'
        ? `${resp.topicName} ${this.searchText}`
        : this.topicId == 'latest'
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
      const category = this.categories.find(e => e.id == this.filter)
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
    const newPostModal = this.scope.newPostModal
    newPostModal.initialize(topic)
    newPostModal.show()

  }
  doFilterOrder($event){
    this.filterOrderPopover.show($event)
  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && (history.backView.stateName == Controllers.TopicListController.STATE
      || history.backView.stateName == Controllers.SearchController.STATE)){
      this.ionicHistory.goBack()
    }
    else {
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
      const lastIndexPos = indexArr.length == 0 ? 0 : indexArr[indexArr.length - 1] + 1
      const index = str.indexOf(keyword,lastIndexPos)
      if(index == -1 || !str || !keyword){
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
              content[bracePos[0]] == '<'
              && content[bracePos[1]] == '>'
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

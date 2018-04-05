/**
 * Created by Gaplo917 on 6/2/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import {FindMessageRequest} from "../model/requests"

export class LikesController{
  static get STATE() { return 'tab.likes'}
  static get NAME() { return 'LikesController'}
  static get CONFIG() { return {
    url: '/likes',
    views: {
      'main': {
        templateUrl: 'templates/tab-likes.html',
        controller: LikesController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, AuthService,$state,ngToast,MessageService,$sanitize,$ionicActionSheet){
    this.scope = $scope
    this.ngToast = ngToast
    this.pageSize = 5
    this.sanitize = $sanitize
    this.end = false
    this.page = 1
    this.ionicActionSheet = $ionicActionSheet
    this.messageService = MessageService

    $scope.$on('$ionicView.loaded', (e) => {
      // get the whole list from db
      this.doRefresh()
    })

  }

  doRefresh(){
    this.messageService.getAllLikedPost().safeApply(this.scope, posts => {
      this.wholeMessages = Object.assign([],posts).reverse()
      this.messages = this.wholeMessages.slice(0,this.pageSize)
      this.totalPageNum = Math.ceil(this.wholeMessages.length / this.pageSize)

    }).subscribe()
  }

  loadMore(){
    console.log("loadmore",this.totalPageNum)
    if(this.hasMoreData()){

      const nextPage = parseInt(this.page) + 1
      if(nextPage <= this.totalPageNum){

        const n = Math.min(nextPage * this.pageSize, this.wholeMessages.length)

        this.messages = this.wholeMessages.slice(0, n )

        //update the page count
        this.page = nextPage

      }
      else{
        // set a flag for end
        this.end = true
      }

      this.scope.$broadcast('scroll.infiniteScrollComplete')
    }

  }

  hasMoreData(){
    return !this.end && !this.searchText
  }

  searchOnTextChange(){
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

    const searchMultipleKeyword = (keywordArr, msg, result = { matches: 0 }) => {
      switch (keywordArr.length) {
        case 0 :
          return result
        default :
          const hlm = Object.assign({},msg,{ post : Object.assign({},msg.post)})

          const content = angular.element('<div/>').html(hlm.content).html();
          const title = angular.element('<div/>').html(hlm.post.title).html()
          const keyword = keywordArr[0]

          const searchResult = {
            content: searchAndInjectHighlightBetweenKeyword(content,keyword),
            title: searchAndInjectHighlightBetweenKeyword(title,keyword)
          }

          // set the content
          hlm.content = searchResult.content.hlContent

          // set the title
          hlm.post.title = searchResult.title.hlContent

          result = {
            matches : result.matches + searchResult.content.matches + searchResult.title.matches,
            message: hlm
          }

          return searchMultipleKeyword(keywordArr.slice(1),hlm,result)
      }
    }

    const result = this.wholeMessages.map( msg => {
      // map to a search result
      return searchMultipleKeyword(this.searchText.split(' '),msg)
    }).filter(e => e.matches > 0)  // filter no matches
      .sort((e1,e2) => e2.matches - e1.matches) // sort by matches
      .map(e => e.message)

    if(!this.searchText) {
      this.messages = this.wholeMessages.slice(0,this.pageSize)
    } else {
      this.messages = result
    }
  }

  findMessage(postId,messageId){
    this.scope.$emit(FindMessageRequest.NAME,new FindMessageRequest(postId,messageId))
  }

  onMore(message){
    // Show the action sheet
    var hideSheet = this.ionicActionSheet.show({
      buttons: [
        { text: '<i class="icon ion-ios-redo balanced"></i>開啟' },
        { text: '<i class="icon ion-share balanced"></i>開啟 HKEPC 原始連結' },
      ],
      titleText: '分享連結',
      destructiveText: '<i class="icon ion-heart-broken assertive" style="color:red"></i> 從我的最愛移除',
      cancelText: '取消',
      cancel: () => {
        // add cancel code..
        return true
      },
      buttonClicked: (index) => {
        if(index === 0){
          window.location.href = `#/tab/topics/${message.post.topicId}/posts/${message.post.id}/page/${message.post.page}`
        }
        else {
          window.open(HKEPC.forum.findMessage(message.post.id, message.id));
        }
        return true;
      },
      destructiveButtonClicked: (index) => {
        this.messageService.remove(message)
        this.messages = this.messages.filter(m => m.id != message.id)
        return true
      }
    });

  }

  loadLazyImage(uid, imageSrc) {
    const image = document.getElementById(uid)
    if(image.getAttribute('src') === imageSrc){
      window.open(imageSrc, '_system', 'location=yes')
    }
    else {
      image.setAttribute('src', imageSrc)
    }
  }

  openImage(uid, imageSrc) {
    window.open(imageSrc, '_system', 'location=yes')
  }
}

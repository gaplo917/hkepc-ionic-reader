/**
 * Created by Gaplo917 on 6/2/2016.
 */
import {FindMessageRequest} from "../model/find-message-request"

export class LikesController{

  constructor($scope, $http, authService,$state,ngToast,$message,$sanitize){

    this.http = $http
    this.scope = $scope
    this.chats = []
    this.ngToast = ngToast
    this.pageSize = 5
    this.sanitize = $sanitize
    this.end = false
    this.page = 1

    $scope.$on('$ionicView.enter', (e) => {
      // get the whole list from db
      this.wholeMessages = Object.assign([],$message.getAllLikedPost()).reverse()

      this.messages = this.wholeMessages.slice(0,this.pageSize)

      this.totalPageNum = Math.ceil(this.wholeMessages.length / this.pageSize)
    })

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
    function searchKeywordIndex(str,keyword,indexArr = []){
      const lastIndexPos = indexArr.length == 0 ? 0 : indexArr[indexArr.length - 1] + 1
      const index = str.indexOf(keyword,lastIndexPos)
      if(index == -1 || !str || !keyword){
        return indexArr
      } else {
        return searchKeywordIndex(str,keyword,indexArr.concat([index]))
      }
    }

    function searchBraceIndex(str,indexArr = []) {
      return (searchKeywordIndex(str,'<').concat(searchKeywordIndex(str,'>'))).sort((a,b) => a - b)
    }

    function isIndexInBrace(content,bracePos,index){
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

    function breakContent(content,len, validIndexs,prevPos = 0,splits = []) {
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

    function mergeAndInjectHightLightContent(splits,hlContent = ''){
      switch (splits.length) {
        case 0 :
          return hlContent
        case 1 :
          return `${hlContent}${splits[0]}`
        default :
          const merged = `${hlContent}${splits[0]}<span style="background-color: yellow">${splits[1]}</span>`
          return mergeAndInjectHightLightContent(splits.slice(2),merged)
      }
    }

    const result = this.wholeMessages.map( msg => {
      const content = angular.element('<div/>').html(msg.content).html();
      const keyword = this.searchText

      // find all brace for identify the html tag
      const bracePos = searchBraceIndex(content)

      // search the keyword position
      const validIndex = searchKeywordIndex(content.toLowerCase(),keyword.toLowerCase())
                          .filter(index => !isIndexInBrace(content,bracePos,index))

      const splits = breakContent(content,keyword.length,validIndex)

      // clone a new message object
      const hlm = Object.assign({},msg)

      // set the content
      hlm.content = mergeAndInjectHightLightContent(splits)

      return {
        hasMatch : validIndex.length > 0,
        message: hlm
      }
    }).filter(e => e.hasMatch)
    .map(e => e.message)

    if(!this.searchText) {
      this.messages = this.wholeMessages.slice(0,this.pageSize)
    } else {
      this.messages = result
    }
  }

  findMessage(postId,messageId){
    this.scope.$emit('find',new FindMessageRequest(postId,messageId))
  }
}

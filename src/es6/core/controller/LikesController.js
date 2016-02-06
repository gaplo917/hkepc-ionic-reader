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
    this.pageSize = 3
    this.sanitize = $sanitize
    this.end = false

    // get the whole list from db
    this.wholeMessages = $message.getAllLikedPost().reverse()

    this.messages = this.wholeMessages.slice(0,this.pageSize)

    this.page = 1
    this.totalPageNum = Math.ceil(this.wholeMessages.length / this.pageSize)
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
    function searchKeyword(str,keyword,indexArr = []){
      const lastIndexPos = indexArr.length == 0 ? 0 : indexArr[indexArr.length - 1] + 1
      const index = str.indexOf(keyword,lastIndexPos)
      if(index == -1 || !str || !keyword){
        return indexArr
      } else {
        return searchKeyword(str,keyword,indexArr.concat([index]))
      }
    }

    function searchBrace(str,indexArr = []) {
      return (searchKeyword(str,'<').concat(searchKeyword(str,'>'))).sort((a,b) => a-b)
    }


    const result = this.wholeMessages.map( msg => {
      const content = angular.element('<div/>').html(msg.content).html();
      const keyword = this.searchText

      // find all brace for identify the html tag
      const bracePos = searchBrace(content)

      // search the keyword position
      const validIndex = searchKeyword(content.toLowerCase(),keyword.toLowerCase())
                          .filter(index => {

                            // filter the position in the brace
                            for(let i =0 ; i < bracePos.length ; i++){
                              if(i < bracePos.length - 1 && content[bracePos[i]] == '<' && content[bracePos[i+1]] == '>' && index > bracePos[i] && index < bracePos[i + 1]){
                                return false
                              }
                            }
                            return true
                          })

      const hlm = Object.assign({},msg)
      let splits = []
      for(let i = 0; i < validIndex.length ; i++ ){
        const contentIndex = validIndex[i]
        const prevIndex = i == 0 ? 0 : validIndex[i - 1] + keyword.length
        splits = splits.concat([
          content.slice(prevIndex ,contentIndex),
          content.slice(contentIndex,contentIndex + keyword.length),
        ])

        if(i == validIndex.length - 1){
          splits = splits.concat([
            content.slice(Math.min(contentIndex + keyword.length,content.length)),
          ])
        }

      }

      let hlContent = ''

      for(let i = 0; i < splits.length ; i += 2){
        if( i != splits.length - 1){
          hlContent += `${splits[i]}<span style="background-color: yellow">${splits[i+1]}</span>`
        }else {
          hlContent+= `${splits[i]}`
        }
      }

      hlm.content = hlContent

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

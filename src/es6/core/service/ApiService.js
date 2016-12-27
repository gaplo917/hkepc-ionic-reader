/**
 * Created by Gaplo917 on 21/12/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import Mapper from "../mapper/mapper";
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"

export class ApiService {
  /**
   * @return {string}
   */
  static get NAME() {
    return 'apiService'
  }

  static get DI() {
    return ($http,rx, $rootScope) => new ApiService($http,rx, $rootScope)
  }

  constructor($http, rx, $rootScope) {
    this.http = $http
    this.rx = rx
    this.$rootScope = $rootScope
  }

  /**
   * Use Rx to wrap Angular httpPromise for better data modeling
   * @param httpPromise
   * @returns {Observable<*>}
   */
  composeApi(httpPromise){
    return this.rx.Observable.fromPromise(httpPromise).do(
      resp => {
        // on api success, anything need to handle?

        // make the rx stream to error if the status code >= 400
        if(resp.status >= 400) throw resp
      },
      error => {
        // on api fail
      },
      completed => {
        // on api completed
        // force scope update to reflect UI changes
        this.$rootScope.$apply()
      }
    )
  }

  emitCommonInfoExtractEvent(html){
    const $ = html.getCheerio()
    this.$rootScope.$emit(CommonInfoExtractRequest.NAME, new CommonInfoExtractRequest($))
  }

  topicList(){
    return this.composeApi(this.http.get(HKEPC.forum.index()))
      .map(Mapper.responseToGeneralHtml)
      .do( _ => this.emitCommonInfoExtractEvent(_))
      .map(Mapper.topicListHtmlToTopicList)
  }

  postListPage(opt){
    const {topicId, pageNum, filter, order, searchId} = opt

    const request = (topicId == 'latest' && pageNum > 1)
      ? HKEPC.forum.latestNext(searchId, pageNum)
      : HKEPC.forum.topics(topicId, pageNum, filter,order)

    return this.composeApi(this.http.get(request))
      .map(Mapper.responseToGeneralHtml)
      .do( _ => this.emitCommonInfoExtractEvent(_))
      .map(html => Mapper.postListHtmlToPostListPage(html,pageNum))
  }

  postDetails(opt){
    const {topicId, postId, page} = opt

    return this.composeApi(this.http.get(HKEPC.forum.posts(topicId,postId,page)))
      .map(Mapper.responseToHKEPCHtml)
      .do( _ => this.emitCommonInfoExtractEvent(_))
      .map(html => Mapper.postHtmlToPost(html,opt))

  }

  userProfile(uid) {
    return this.composeApi(this.http.get(`http://www.hkepc.com/forum/space.php?uid=${uid}`))
      .map(Mapper.responseToHKEPCHtml)
      .do( _ => this.emitCommonInfoExtractEvent(_))
      .map(Mapper.userProfileHtmlToUserProfile)
  }
}

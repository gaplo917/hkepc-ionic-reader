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

  topicList(){
    return this.composeApi(this.http.get(HKEPC.forum.index()))
      .map(Mapper.htmlToCherrio)
      .do(($) => {
        this.$rootScope.$emit(CommonInfoExtractRequest.NAME, new CommonInfoExtractRequest($))
      })
      .map(Mapper.topicListHtmlToTopicList)
  }

  postListPage(opt){
    const {topicId, pageNum, filter, order, searchId} = opt

    const request = (topicId == 'latest' && pageNum > 1)
      ? HKEPC.forum.latestNext(searchId, pageNum)
      : HKEPC.forum.topics(topicId, pageNum, filter,order)

    return this.composeApi(this.http.get(request))
      .map(Mapper.htmlToCherrio)
      .do(($) => {
        this.$rootScope.$emit(CommonInfoExtractRequest.NAME, new CommonInfoExtractRequest($))
      })
      .map($ => Mapper.postListHtmlToPostListPage($,pageNum))
  }
}

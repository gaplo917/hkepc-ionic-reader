/**
 * Created by Gaplo917 on 21/12/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import Mapper from "../mapper/mapper";
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
const work = require('webworkify');

const cheerioWorker = work(require('../cheerio-worker'));


export class ApiService {
  /**
   * @return {string}
   */
  static get NAME() {
    return 'apiService'
  }

  static get DI() {
    return ($http,rx,$rootScope) => new ApiService($http,rx,$rootScope)
  }

  constructor($http, rx, $rootScope,) {
    this.http = $http
    this.rx = rx
    this.$rootScope = $rootScope

    this.rx.Observable.fromWebWorkerAndTopic = function(worker, topicKey){
      return this.fromEvent(worker, 'message')
        .map(_ => _.data) // unwrap from event.data
        .filter(_ => _.topic == topicKey)
        .map(_ => _.data) // real data we need
    }

    // make a extension to bridge global web worker
    this.rx.Observable.prototype.flatMapApiFromCheerioworker = function(topicKey, data = {}){
      return this.do(resp => cheerioWorker.postMessage(
          Object.assign({ topic: topicKey, data: resp.data}, data)
        )
      )
      .flatMap(() => rx.Observable.fromWebWorkerAndTopic(cheerioWorker, topicKey).take(1))
      .do(result => console.log(topicKey, result))
    }

    this.rx.Observable.fromWebWorkerAndTopic(cheerioWorker, 'commonInfo')
      .do(console.log)
      .subscribe(data => {
        $rootScope.$emit(CommonInfoExtractRequest.NAME, new CommonInfoExtractRequest(
          data.username,
          data.pmNotification,
          data.postNotification,
          data.formhash
        ))
      })
  }

  /**
   * Use Rx to wrap Angular httpPromise for better data modeling
   * @param httpPromise
   * @returns {Observable<*>}
   */
  composeApi(httpPromise){
    return this.rx.Observable.fromPromise(httpPromise)
      .observeOn(this.rx.Scheduler.default)
      .subscribeOn(this.rx.Scheduler.default)
      .do(
      resp => {
        // on api success, anything need to handle?
      },
      error => {
        // on api fail
      },
      completed => {
        // on api completed
        // force scope update to reflect UI changes
        // this.$rootScope.$applyAsync()
      }
    )
  }

  topicList(){
    return this.composeApi(this.http.get(HKEPC.forum.index()))
      .flatMapApiFromCheerioworker('topicList')
  }

  postListPage(opt){
    const {topicId, pageNum, filter, order, searchId} = opt

    const request = topicId == 'search'
      ? HKEPC.forum.latestNext(searchId, pageNum)
      : (topicId == 'latest' && pageNum > 1)
        ? HKEPC.forum.latestNext(searchId, pageNum)
        : HKEPC.forum.topics(topicId, pageNum, filter,order)

    return this.composeApi(this.http.get(request))
      .flatMapApiFromCheerioworker('postListPage', { pageNum: pageNum })
  }

  postDetails(opt){
    const {topicId, postId, page, orderType, filterOnlyAuthorId} = opt

    return this.composeApi(this.http.get(HKEPC.forum.posts(topicId,postId,page,orderType,filterOnlyAuthorId)))
      .flatMapApiFromCheerioworker('postDetails', {
        opt: opt,
        currentHash: window.location.hash
      })

  }

  userProfile(uid) {
    return this.composeApi(this.http.get(`http://www.hkepc.com/forum/space.php?uid=${uid}`))
      .flatMapApiFromCheerioworker('userProfile')
  }

  subscribeNewReply(postId){
    return this.composeApi(this.http.get(HKEPC.forum.subscribeNewReply(postId)))
  }

  memberCenter(){
    return this.composeApi(this.http.get(HKEPC.forum.memberCenter()))
      .flatMapApiFromCheerioworker('memberCenter')
  }

  checkPM(){
    return this.composeApi(this.http.get(HKEPC.forum.checkPM()))
      .flatMapApiFromCheerioworker('checkPM')
  }

  search(formhash, searchText) {
    const postUrl = HKEPC.forum.search()
    const postData = [
      `formhash=${encodeURIComponent(formhash)}`,
      `srchtype=title`,
      `srchtxt=${encodeURIComponent(searchText)}`,
      `searchsubmit=true`,
      "st=on",
      "rchuname=",
      "srchfilter=all",
      "srchfrom=0",
      "before=",
      "orderby=lastpost",
      "ascdesc=desc",
      "srchfid[]=all",
    ].join('&')

    console.log(postData)
    return this.composeApi(this.http.post(`${postUrl}?${postData}`)).flatMapApiFromCheerioworker('search')
  }
}

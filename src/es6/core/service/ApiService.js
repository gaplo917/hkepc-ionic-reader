/**
 * Created by Gaplo917 on 21/12/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import Mapper from "../mapper/mapper";
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
import {HybridHttp} from "../bridge/HybridHttp"
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
    this.http = new HybridHttp($http,rx)
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

  login(username, password){
    return this.http.request({
      method: 'POST',
      url: HKEPC.forum.login(),
      data: {
        username: username,
        password: password,
        cookietime: 2592000
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
  }

  logout(formhash) {
    return this.http.request({
      method: 'POST',
      url: HKEPC.forum.logout(formhash)
    })
  }

  topicList(){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.index()
    }).flatMapApiFromCheerioworker('topicList')
  }

  postListPage(opt){
    const {topicId, pageNum, filter, order, searchId} = opt

    const url = topicId == 'search'
      ? HKEPC.forum.latestNext(searchId, pageNum)
      : (topicId == 'latest' && pageNum > 1)
        ? HKEPC.forum.latestNext(searchId, pageNum)
        : HKEPC.forum.topics(topicId, pageNum, filter,order)

    return this.http.request({
      method: 'GET',
      url: url
    }).flatMapApiFromCheerioworker('postListPage', { pageNum: pageNum })
  }

  postDetails(opt){
    const {topicId, postId, page, orderType, filterOnlyAuthorId} = opt

    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.posts(topicId,postId,page,orderType,filterOnlyAuthorId)
    })
      .flatMapApiFromCheerioworker('postDetails', {
        opt: opt,
        currentHash: window.location.hash
      })

  }

  userProfile(uid) {
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.space(uid)
    })
      .flatMapApiFromCheerioworker('userProfile')
  }

  subscribeNewReply(postId){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.subscribeNewReply(postId)
    })
  }

  memberCenter(){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.memberCenter()
    })
      .flatMapApiFromCheerioworker('memberCenter')
  }

  checkPM(){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.checkPM()
    })
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
    return this.http.request({
      method: 'POST',
      url: `${postUrl}?${postData}`
    })
      .flatMapApiFromCheerioworker('search')
  }

  chatList(page){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.pmList(page)
    })
  }

  chatDetails(senderId){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.pm(senderId)
    })
  }

  postChatMessage(opt){
    return this.http.request(opt)
  }

  settings(){
    return this.http.request({
      method : 'GET',
      url: HKEPC.forum.settings()
    })
  }

  dynamicRequest(opt){
    return this.http.request(opt)
  }

  myPosts(page){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.myPost(page)
    })
  }

  myReplies(page){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.myReply(page)
    })
  }

  epcNews(page){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.news(page)
    })
  }

  notifications(page){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.notifications(page)
    })
  }

  preNewPost(topicId){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.newPost(topicId)
    })
  }

  reportPage(topicId, postId, messageId){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.reportPage(topicId, postId, messageId)
    })
  }

  replyPage(reply){
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.replyPage(reply)
    })
  }
}

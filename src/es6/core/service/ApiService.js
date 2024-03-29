/**
 * Created by Gaplo917 on 21/12/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import { CommonInfoExtractRequest } from '../model/requests'
import { HybridHttp } from '../bridge/HybridHttp'
const cheerioWorker = new Worker(new URL('../cheerio-worker.js', import.meta.url))

export class ApiService {
  /**
   * @return {string}
   */
  static get NAME() {
    return 'apiService'
  }

  static get DI() {
    return ($http, rx, $rootScope, ngToast) => new ApiService($http, rx, $rootScope, ngToast)
  }

  constructor($http, rx, $rootScope, ngToast) {
    this.webHttp = $http
    this.http = new HybridHttp($http, rx, ngToast)
    this.rx = rx
    this.$rootScope = $rootScope

    this.rx.Observable.fromWebWorkerAndTopic = function (worker, topicKey) {
      return this.fromEvent(worker, 'message')
        .map((_) => _.data) // unwrap from event.data
        .filter((_) => _.topic === topicKey)
        .map((_) => _.data) // real data we need
    }

    // make a extension to bridge global web worker
    this.rx.Observable.prototype.flatMapApiFromCheerioworker = function (topicKey, data = {}) {
      return this.do((resp) => {
        if (!resp.data) throw new Error('response is not valid')

        cheerioWorker.postMessage(Object.assign({ topic: topicKey, data: resp.data }, data))
      })
        .flatMap(() => rx.Observable.fromWebWorkerAndTopic(cheerioWorker, topicKey).take(1))
        .do((result) => console.log(topicKey, result))
    }

    this.rx.Observable.fromWebWorkerAndTopic(cheerioWorker, 'commonInfo')
      .do(console.log)
      .filter((resp) => resp /* not empty, not null, not undefined */)
      .subscribe((data) => {
        $rootScope.$emit(
          CommonInfoExtractRequest.NAME,
          new CommonInfoExtractRequest(data.username, data.pmNotification, data.postNotification, data.formhash)
        )
      })
  }

  dynamicRequest(opt) {
    return this.http.request(opt)
  }

  login({ username, password, securityQuestionId, securityQuestionAns }) {
    return this.http.request({
      method: 'POST',
      url: HKEPC.forum.login(),
      data: {
        username,
        password,
        questionid: securityQuestionId,
        answer: securityQuestionAns,
        cookietime: 2592000,
        referer: 'https://www.hkepc.com/forum/',
        loginsubmit: true,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  }

  logout(formhash) {
    return this.http.request({
      method: 'POST',
      url: HKEPC.forum.logout(formhash),
    })
  }

  topicList() {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.index(),
      })
      .flatMapApiFromCheerioworker('topicList')
  }

  fullTopicListFromSearch() {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.search(),
      })
      .flatMapApiFromCheerioworker('fullTopicListFromSearch')
  }

  postListPage(opt) {
    const { topicId, pageNum, filter, order, searchId } = opt

    const url = () => {
      switch (topicId) {
        case 'search':
          return HKEPC.forum.latestNext(searchId, pageNum)
        case 'latest':
          return HKEPC.forum.latestNext(searchId, pageNum)
        case 'latestPost':
          return HKEPC.forum.latestPostNext(searchId, pageNum)
        default:
          return HKEPC.forum.topics(topicId, pageNum, filter, order)
      }
    }

    return this.http
      .request({
        method: 'GET',
        url: url(),
      })
      .flatMapApiFromCheerioworker('postListPage', { pageNum })
  }

  postDetails(opt) {
    const { topicId, postId, page, orderType, filterOnlyAuthorId, isAutoLoadImage } = opt

    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.posts(topicId, postId, page, orderType, filterOnlyAuthorId),
      })
      .flatMapApiFromCheerioworker('postDetails', {
        opt,
        currentHash: window.location.hash,
        isAutoLoadImage,
      })
  }

  findMessage(opt) {
    const { postId, messageId, isAutoLoadImage } = opt
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.findMessage(postId, messageId),
      })
      .flatMapApiFromCheerioworker('findMessage', {
        opt,
        currentHash: window.location.hash,
        isAutoLoadImage,
      })
  }

  userProfile(uid) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.space(uid),
      })
      .flatMapApiFromCheerioworker('userProfile', { uid })
  }

  addFavPost(postId) {
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.addFavPost(postId),
    })
  }

  subscribeNewReply(postId) {
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.subscribeNewReply(postId),
    })
  }

  memberCenter() {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.memberCenter(),
      })
      .flatMapApiFromCheerioworker('memberCenter')
  }

  checkPM() {
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.checkPM(),
    })
  }

  search(formhash, searchText) {
    const postUrl = HKEPC.forum.search()
    const postData = [
      `formhash=${encodeURIComponent(formhash)}`,
      'srchtype=title',
      `srchtxt=${encodeURIComponent(searchText)}`,
      'searchsubmit=true',
      'st=on',
      'rchuname=',
      'srchfilter=all',
      'srchfrom=0',
      'before=',
      'orderby=lastpost',
      'ascdesc=desc',
      'srchfid[]=all',
    ].join('&')

    return this.http
      .request({
        method: 'POST',
        url: `${postUrl}?${postData}`,
      })
      .flatMapApiFromCheerioworker('search')
  }

  chatList(page) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.pmList(page),
      })
      .flatMapApiFromCheerioworker('chatList')
  }

  chatDetails(senderId) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.pm(senderId),
      })
      .flatMapApiFromCheerioworker('chatDetails')
  }

  settings() {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.settings(),
      })
      .flatMapApiFromCheerioworker('settings')
  }

  myPosts(page, type) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.myPost(page, type),
      })
      .flatMapApiFromCheerioworker('myPost')
  }

  myReplies(page) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.myReply(page),
      })
      .flatMapApiFromCheerioworker('myReplies')
  }

  epcNews(page) {
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.news(page),
    })
  }

  notifications(page) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.notifications(page),
      })
      .flatMapApiFromCheerioworker('notifications')
  }

  preNewPost(topicId) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.newPost(topicId),
      })
      .flatMapApiFromCheerioworker('epcEditorData')
  }

  preEditMessage(topicId, postId, messageId) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.editMessage(topicId, postId, messageId),
      })
      .flatMapApiFromCheerioworker('epcEditorData')
  }

  getReportDialog(topicId, postId, messageId) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.reportDialog(topicId, postId, messageId),
      })
      .flatMapApiFromCheerioworker('reportEditorXmlData', { isXml: true })
  }

  replyPage(reply) {
    return this.http
      .request({
        method: 'GET',
        url: HKEPC.forum.replyPage(reply),
      })
      .flatMapApiFromCheerioworker('epcEditorData')
  }

  preSendPm(uid) {
    return this.http.request({
      method: 'GET',
      url: HKEPC.forum.preSendPm(uid),
    })
  }

  version(isAndroid) {
    const versionMD = isAndroid ? 'version.android.md' : 'version.md'
    return this.rx.Observable.fromPromise(
      this.webHttp({
        method: 'GET',
        url: `templates/about/${versionMD}`,
      })
    )
  }
}

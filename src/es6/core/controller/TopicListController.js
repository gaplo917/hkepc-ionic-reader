/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
const cheerio = require('cheerio')
const async = require('async')

export class TopicListController {
  static get STATE() { return 'tab.topics'}
  static get NAME() { return 'TopicListController'}
  static get CONFIG() { return {
    url: '/topics',
    views: {
      'tab-topics': {
        templateUrl: 'templates/tab-topics.html',
        controller: TopicListController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,$http,LocalStorageService,AuthService,ngToast) {

    this.scope = $scope
    this.http = $http
    this.localStorageService = LocalStorageService
    this.topics = []

    // create a UI rendering queue
    this.queue = async.queue((task, callback) => {

      // update the topics list
      this.topics.push(task())

      if(this.queue.length() % 5 == 0){
        // force update the view after 3 task
        this.scope.$apply()
      }

      setTimeout(() => callback(), 20)
    }, 1);

    $scope.$on('$ionicView.loaded', (e) => {
      const topics = this.localStorageService.getObject('topics')
      if(Object.keys(topics).length == 0){
        this.loadList()
      }
      else{
        ngToast.success('正在使用快取..')

        console.log('[TopicListController]','using cache')
        this.cached = true
        this.topics = topics
      }

    })

    $scope.$on('$ionicView.enter', (e) => {
      this.queue.resume()
    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      this.queue.pause()
    })

    // send the login from db
    if(AuthService.isLoggedIn()){
      this.scope.$emit("accountTabUpdate",AuthService.getUsername())
    }
  }

  reset(){
    // clear the queue
    this.queue.kill()

    // reset the model
    this.topics = []
  }

  loadList() {
    //remove the cached badge
    this.cached = false

    this.http
        .get(HKEPC.forum.index())
        .then((resp) => {

          console.log(resp.config)
          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.imageUrl)
              .getCheerio()

          const currentUsername = $('#umenu > cite').text()

          // send the login name to parent controller
          this.scope.$emit("accountTabUpdate",currentUsername)

          const tasks = $('#mainIndex > div').map((i, elem) => {

            return () => {

              const source = cheerio.load($(elem).html())

              const groupName = $(elem).hasClass('group')
                  ? source('a').text()
                  : undefined

              const topicId = URLUtils.getQueryVariable(source('.forumInfo .caption').attr('href'), 'fid')
              const topicName = source('.forumInfo .caption').text()
              const description = source('.forumInfo p').next().text()
              const image = source('.icon img').attr('src')

              return {
                id: topicId,
                name: topicName,
                image: image,
                groupName: groupName,
                description: description
              }

            }

          }).get()

          this.queue.push(tasks, (err) => {
            // call back of each task
          })

          this.queue.drain = () => {
            this.localStorageService.setObject('topics',this.topics)
            this.scope.$apply()
          }

        })
  }

  doRefresh(){

    this.reset()

    this.loadList()
  }

  onTouch(){
    console.log("ontouch")
    this.queue.pause()
  }

  onRelease(){
    console.log("onRelease")
    setTimeout(() => {
      this.queue.resume()
    },250)
  }

  canShowGroupNameIniOSReview(groupName){
    return !ionic.Platform.isIOS() || groupName != 'Mobile Phone'
  }

  canShowIniOSReview(topicId){
    const blackList = [121,123,202]
    return !ionic.Platform.isIOS() || blackList.indexOf(parseInt(topicId)) < 0
  }

  canShowSectionInIOSReview(topicId){
    const blackList = [171,168,170,44,277]
    return !ionic.Platform.isIOS() || blackList.indexOf(parseInt(topicId)) < 0
  }
}
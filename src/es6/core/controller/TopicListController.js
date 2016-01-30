/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class TopicListController {

  constructor($scope,$http,$localstorage,authService,ngToast) {

    this.scope = $scope
    this.http = $http
    this.localstorage = $localstorage
    this.topics = []

    // create a UI rendering queue
    this.q = async.queue((task, callback) => {

      // update the topics list
      this.topics.push(task())

      if(this.q.length() % 5 == 0){
        // force update the view after 3 task
        this.scope.$apply()
      }

      setTimeout(() => callback(), 20)
    }, 1);

    $scope.$on('$ionicView.loaded', (e) => {
      const topics = this.localstorage.getObject('topics')
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
      this.q.resume()
    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      this.q.pause()
    })

    // send the login from db
    if(authService.isLoggedIn()){
      this.scope.$emit("accountTabUpdate",authService.getUsername())
    }
  }

  reset(){
    // clear the queue
    this.q.kill()

    // reset the model
    this.topics = []
  }

  loadList(cb) {
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

          this.q.push(tasks, (err) => {
            // call back of each task
          })

          this.q.drain = () => {
            this.localstorage.setObject('topics',this.topics)
            this.scope.$apply()
          }

          // callback
          if(cb) cb(null)

        }, (err) => {
          alert("error")
          console.error('ERR', JSON.stringify(err))
          if(cb) cb(err)
        })
  }

  doRefresh(){

    this.reset()

    this.loadList(() => {
      this.scope.$broadcast('scroll.refreshComplete');
    })
  }

  onTouch(){
    console.log("ontouch")
    this.q.pause()
  }

  onRelease(){
    console.log("onRelease")
    setTimeout(() => {
      this.q.resume()
    },250)
  }
}
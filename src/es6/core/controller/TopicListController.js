/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class TopicListController {

  constructor($scope,$http) {

    $scope.vm = this
    this.scope = $scope
    this.http = $http

    // create a UI rendering queue
    this.q = async.queue((task, callback) => {

      // update the topics list
      this.topics.push(task())

      if(this.q.length() % 10 == 0){
        // force update the view after 10 task
        this.scope.$apply()
      }

      setTimeout(() => callback(), 20)
    }, 1);

    $scope.$on('$ionicView.loaded', (e) => {
      this.loadList()
    })
  }

  reset(){
    // clear the queue
    this.q.kill()

    // reset the model
    this.topics = []
  }

  loadList(cb) {

    this.http
        .get(HKEPC.forum.index)
        .then((resp) => {

          let $ = cheerio.load(resp.data)

          const tasks = $('#mainIndex > div').map((i, elem) => {

            return () => {

              const source = cheerio.load($(elem).html())

              const groupName = $(elem).hasClass('group')
                  ? source('a').text()
                  : undefined

              const topicId = URLUtils.getQueryVariable(source('.forumInfo .caption').attr('href'), 'fid')
              const topicName = source('.forumInfo .caption').text()
              const description = source('.forumInfo p').next().text()

              return {
                id: topicId,
                name: topicName,
                groupName: groupName,
                description: description
              }

            }

          }).get()

          this.q.push(tasks, (err) => {
            console.log("finished!")
          })

          // callback
          if(cb) cb(null)

        }, (err) => {
          alert("error")
          console.error('ERR', JSON.stringify(err))
          cb(err)
        })
  }

  doRefresh(){

    this.reset()

    this.loadList(() => {
      this.scope.$broadcast('scroll.refreshComplete');
    })
  }
}
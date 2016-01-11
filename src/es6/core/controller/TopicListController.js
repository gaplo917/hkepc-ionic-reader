/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as cheerio from "cheerio"
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"

export class TopicListController {

  constructor($scope,$http) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //})

    $scope.$on('$ionicView.loaded', function(e) {

      $http
          .get(HKEPC.forum.index)
          .then((resp) => {
            let $ = cheerio.load(resp.data, {decodeEntities: true})

            let topics = []

            $('#mainIndex > div').each(function (i, elem) {
              let source = cheerio.load($(this).html())

              const groupName = $(this).hasClass('group')
                  ? source('a').text()
                  : undefined

              const topicId = URLUtils.getQueryVariable(source('.forumInfo .caption').attr('href'), 'fid')
              const topicName = source('.forumInfo .caption').text()
              const description = source('.forumInfo p').next().text()

              topics.push({
                id: topicId,
                name: topicName,
                groupName: groupName,
                description: description
              })

            })

            angular.extend($scope,{
              topics:topics
            })

            // For JSON responses, resp.data contains the result
          }, (err) => {
            alert("error")
            console.error('ERR', JSON.stringify(err))
            // err.status will contain the status code
          })
    })
  }
}
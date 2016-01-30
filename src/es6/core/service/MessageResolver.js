/**
 * Created by Gaplo917 on 30/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {HKEPCHtml} from "../model/hkepc-html"
var cheerio = require('cheerio')

export var MessageResolver = {
  name: 'messageResolver',

  impl: ['$http','$q','$sce','$message',function ($http,$q,$sce,$message) {

    return {
      resolve: (url) => {
        "use strict";
        var deferred = $q.defer();

        $http.get(url)
        .then((resp) => {
          const html = new HKEPCHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processEpcUrl()
              .processImgUrl(HKEPC.baseUrl)
              .getCheerio()

          const postTitle = html
              .getTitle()
              .split('-')[0]

          const page = $('.forumcontrol .pages strong').first().text()
          const pageBtnSource = $('.forumcontrol .pages a').first()
          const topicId = URLUtils.getQueryVariable(pageBtnSource.attr('href'), 'fid')
          const postId = URLUtils.getQueryVariable(pageBtnSource.first().attr('href'), 'tid')
          const messageId = URLUtils.getQueryVariable(url, 'pid')

          //const url = this.state.href('tab.topics-posts-detail',{
          //  topicId: topicId,
          //  postId: postId,
          //  page: page
          //})

          let postSource = cheerio.load($(`#pid${messageId}`).parent().html())

          const ads = postSource('.adv').html()
          postSource('.adv').remove()

          const message = {
            id: postSource('table').attr('id').replace('pid',''),
            pos: postSource('.postinfo strong a em').text(),
            inAppUrl: url,
            createdAt: postSource('.posterinfo .authorinfo em').text(),
            content : $sce.trustAsHtml(
                // main content
                postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html() ||
                postSource('.postcontent > .defaultpost > .postmessage').html() // for banned message
            ),
            ads: $sce.trustAsHtml(ads),
            post:{
              id: postId,
              topicId: topicId,
              title: postTitle,
              page: 1
            },
            author:{
              image: postSource('.postauthor .avatar img').attr('src'),
              name : postSource('.postauthor > .postinfo').text()
            }
          }

          message.likedStyle = $message.isLikedPost(message)
              ? {color: '#0c60ee'}
              : {}

          deferred.resolve({
            message: message
          })
        },(err) => deferred.reject(err))

        return deferred.promise;
      }
    }
  }]
}
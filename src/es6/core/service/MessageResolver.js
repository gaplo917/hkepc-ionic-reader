/**
 * Created by Gaplo917 on 30/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')

export var ReplyResolver = {
  name: 'replyResolver',

  impl: ['$http','$q',function ($http,$q) {

    return {
      resolve: (url) => {
        "use strict";
        var deferred = $q.defer();

        this.http.get(url)
        .then((resp) => {
          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseUrl)
              .getCheerio()

          const page = $('.forumcontrol .pages strong').first().text()
          const pageBtnSource = $('.forumcontrol .pages a').first()
          const topicId = URLUtils.getQueryVariable(pageBtnSource.attr('href'), 'fid')
          const postId = URLUtils.getQueryVariable(pageBtnSource.first().attr('href'), 'tid')
          const messageId = URLUtils.getQueryVariable(url, 'pid')
          console.log(page,topicId,postId)

          const url = this.state.href('tab.topics-posts-detail',{
            topicId: topicId,
            postId: postId,
            page: page
          })

          deferred.resolve({
            html: $(`#pid${messageId}`).html()
          })
        },(err) => deferred.reject(err))

        return deferred.promise;
      }
    }
  }]
}
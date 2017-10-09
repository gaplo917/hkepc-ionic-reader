var cheerio = require('cheerio');
import * as URLUtils from '../utils/url'
import {GeneralHtml} from './model/general-html'
import {HKEPCHtml} from './model/hkepc-html'
import Mapper from "./mapper/mapper";

module.exports = function (self) {
  self.addEventListener('message',function (ev){
    const {topic, data, currentHash, isAutoLoadImage} = ev.data

    const html = new HKEPCHtml(cheerio.load(data))
        .removeIframe()
        .processImgUrl('https://www.hkepc.com/forum')
        .processImageToLazy(isAutoLoadImage === undefined ? true : isAutoLoadImage)
        .processEpcUrl(currentHash || "")
        .processExternalUrl()

    self.postMessage({
      topic: 'commonInfo',
      data: html.getLoggedInUserInfo()
    })

    console.log(html.getLoggedInUserInfo())
    switch(topic) {
      case 'topicList':

        self.postMessage({
          topic: topic,
          data: Mapper.topicListHtmlToTopicList(html)
        })

        break

      case 'postListPage':
        const pageNum = ev.data.pageNum

        self.postMessage({
          topic: topic,
          data: Mapper.postListHtmlToPostListPage(html,pageNum)
        })

        break

      case 'postDetails':
        const opt = ev.data.opt
        self.postMessage({
          topic: topic,
          data: Mapper.postHtmlToPost(html, opt)
        })

        break

      case 'userProfile':
        self.postMessage({
          topic: topic,
          data: Mapper.userProfileHtmlToUserProfile(html)
        })
        break

      case 'search':

        self.postMessage({
          topic: topic,
          data: Mapper.postListHtmlToPostListPage(html,1)
        })
        break

      default:
        console.log(`No special handling of topic=${topic}`)
        self.postMessage({
          topic: topic,
          data: {}
        })
        break
    }

  })


}
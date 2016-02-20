/**
 * Created by Gaplo917 on 30/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
const cheerio = require('cheerio')

export class MessageResolver {
  static get NAME () {return 'MessageResolver'}

  static get DI() {
    return ($http,$q,$sce,MessageService) => new MessageResolver($http,$q,$sce,MessageService)
  }

  constructor($http,$q,$sce,MessageService) {
    this.http = $http
    this.q = $q
    this.sce = $sce
    this.messageService = MessageService
  }

  resolve (url) {
    const deferred = this.q.defer();

    this.http.get(url)
        .then((resp) => {
          const html = new HKEPCHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseUrl)
              .processEpcUrl()
              .processExternalUrl()
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

          const adsSource = postSource('.adv')

          // extract the ads before remove from the parent
          const hasAds = adsSource.has('iframe')
          const ads = hasAds && !ionic.Platform.isIOS() ? adsSource.html() : undefined

          // really remove the ads
          adsSource.remove()

          const message = {
            id: postSource('table').attr('id').replace('pid',''),
            pos: postSource('.postinfo strong a em').text(),
            createdAt: postSource('.posterinfo .authorinfo em').text(),
            content : this.sce.trustAsHtml(
                // main content
                postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html() ||
                postSource('.postcontent > .defaultpost > .postmessage').html() // for banned message
            ),
            ads: this.sce.trustAsHtml(ads),
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

          deferred.resolve({
            message: message
          })
        },(err) => deferred.reject(err))

    return deferred.promise;
  }
}

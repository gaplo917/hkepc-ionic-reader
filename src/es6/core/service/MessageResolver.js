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

          const pageLinkHint = html.getCheerio()('.authorinfo a').attr('href')

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseForumUrl)
              .processEpcUrl(window.location.hash)
              .processExternalUrl()
              .getCheerio()

          const postTitle = html
              .getTitle()
              .split('-')[0]

          const topicId = URLUtils.getQueryVariable(pageLinkHint, 'fid')
          const postId = URLUtils.getQueryVariable(pageLinkHint, 'tid')
          const messageId = URLUtils.getQueryVariable(url, 'pid')

          let postSource = cheerio.load($(`#pid${messageId}`).parent().html())

          const adsSource = postSource('.adv')

          // extract the ads before remove from the parent
          const hasAds = adsSource.has('iframe')
          const ads = hasAds && !ionic.Platform.isIOS() && !ionic.Platform.isAndroid() ? adsSource.html() : undefined

          // really remove the ads
          adsSource.remove()

          const pageNumArr = $('.pages strong')
              .map((i,elem) => $(elem).text())
              .get()
              .map(e => e.match(/\d/g)) // array of string with digit
              .filter(e => e != null) // filter null value
              .map(e => parseInt(e.join(''))) // join the array and parseInt

          const currentPage = pageNumArr.length == 0
              ? 1
              : Math.max(...pageNumArr)

          const message = {
            id: messageId,
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
              page: currentPage
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

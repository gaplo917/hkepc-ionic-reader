import * as HKEPC from '../../data/config/hkepc'
const cheerio = require('cheerio')
import {GeneralHtml} from '../model/general-html'
import {HKEPCHtml} from '../model/hkepc-html'
import * as URLUtils from '../../utils/url'

export default class Mapper{

  static apiSuccess(o) { return { message: o.message }}

  static responseToGeneralHtml(resp) {
    const html = new GeneralHtml(cheerio.load(resp.data))

    return html
      .removeIframe()
      .processImgUrl(HKEPC.imageUrl)
  }

  static responseToHKEPCHtml(resp) {
    const html = new HKEPCHtml(cheerio.load(resp.data))

    return html.processImgUrl(HKEPC.imageUrl)
      .processEpcUrl()
      .processExternalUrl()
  }

  static topicListHtmlToTopicList(html) {

    const $ = html.getCheerio()

    return $('#mainIndex > div').map((i, elem) => {
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

    }).get()
  }

  static postListHtmlToPostListPage(html,pageNum){
    const $ = html.getCheerio()

    // only work for latest
    const searchId = URLUtils.getQueryVariable($('.pages_btns .pages a').first().attr('href'),'searchid')

    const titles = $('#nav').text().split('»')
    const topicName = titles[titles.length - 1]
    const totalPageNumText = $('.pages_btns .pages .last').first().text() || $('.pages_btns .pages a').not('.next').last().text()
    const subTopicList = $('#subforum table h2 a').map((i,elem) => {
      const obj = $(elem)
      const name = obj.text()
      const id = URLUtils.getQueryVariable(obj.attr('href'), 'fid')
      return {
        id: id,
        name: name
      }
    }).get()

    const postCategories = $('.threadtype a').map((i,elem) => {
          const obj = $(elem)
          return {
            id: URLUtils.getQueryVariable(obj.attr('href'), 'typeid'),
            name: obj.text()
          }
        }).get()


    // only extract the number
    const totalPageNum = totalPageNumText
      ? totalPageNumText.match(/\d/g).join("")
      : 1

    const posts = $('.threadlist table tbody').map( (i, elem) => {
      const htmlId = $(elem).attr('id')

      const postSource = cheerio.load($(elem).html())
      // fall back for latest postUrl finding
      const postUrl = postSource('tr .subject span a').attr('href') || /* latest post */postSource('tr .subject a').attr('href')
      const postTitleImgUrl = postSource('tr .folder img').attr('src')

      return {
        id: URLUtils.getQueryVariable(postUrl, 'tid'),
        topicId: URLUtils.getQueryVariable(postUrl, 'fid'),
        tag: postSource('tr .subject em a').text() || postSource('.forum a').text(),
        name: postSource('tr .subject span[id^=thread_] a ').text() || postSource('tr .subject > a ').text(),
        lastPost:{
          name: postSource('tr .lastpost cite a').text(),
          timestamp: postSource('tr .lastpost em a span').attr('title') || postSource('tr .lastpost em a').text()
        },
        author: {
          name: postSource('tr .author a').text()
        },
        count: {
          view: postSource('tr .nums em').text(),
          reply: postSource('tr .nums strong').text()
        },
        publishDate: postSource('tr .author em').text(),
        pageNum: pageNum,
        isSticky: htmlId ? htmlId.startsWith("stickthread") : false,
        isRead: postTitleImgUrl ? postTitleImgUrl.indexOf('new') > 0 : false
      }

    }).get()

    return {
      searchId: searchId,
      totalPageNum: totalPageNum,
      subTopicList: subTopicList,
      categories: postCategories,
      posts: posts.filter(_ => _.id && _.name),
      topicName: topicName,
      pageNum: pageNum,
    }
  }

  /**
   *
   * @param html HKEPCHtml
   * @param opt {postId, page}
   * @returns {*}
   */
  static postHtmlToPost(html, opt){

    const {postId, page} = opt

    const $ = html.getCheerio()

    // render the basic information first
    const pageBackLink = $('.forumcontrol .pageback a').attr('href')

    const topicId = URLUtils.getQueryVariable(pageBackLink,'fid')

    // remove the hkepc forum text
    const postTitle = html
      .getTitle()
      .split(' -  電腦領域')[0]

    const pageNumSource = $('.forumcontrol .pages a, .forumcontrol .pages strong')

    const pageNumArr = pageNumSource
      .map((i,elem) => $(elem).text())
      .get()
      .map(e => e.match(/\d/g)) // array of string with digit
      .filter(e => e != null) // filter null value
      .map(e => parseInt(e.join(''))) // join the array and parseInt

    const totalPageNum = pageNumArr.length == 0
      ? 1
      : Math.max(...pageNumArr)

    const messages = $('#postlist > div').map((i, elem) => {

      let postSource = cheerio.load($(elem).html())

      const content = new HKEPCHtml(
        cheerio.load(postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html() ||
          postSource('.postcontent > .defaultpost > .postmessage').html())
      ).processImageToLazy()
        .getCheerio()

      const rank = postSource('.postauthor > p > img').attr('alt')

      const avatarImageUrl = postSource('.postauthor .avatar img').attr('src')

      return {
        id: postSource('table').attr('id').replace('pid',''),
        pos: postSource('.postinfo strong a em').text(),
        createdAt: postSource('.posterinfo .authorinfo em span').attr('title') || postSource('.posterinfo .authorinfo em').text().replace('發表於 ',''),
        content : content.html(),
        post:{
          id: postId,
          topicId: topicId,
          title: postTitle,
          page: page
        },
        author:{
          rank: rank ? rank.replace('Rank: ','') : 0,
          image: avatarImageUrl,
          uid: URLUtils.getQueryVariable(avatarImageUrl,'uid'),
          name : postSource('.postauthor > .postinfo').text().trim(),
          isSelf: false // default is false, mutate later
        }
      }

    }).get()


    return {
      title: postTitle,
      id: postId,
      topicId: topicId,
      totalPageNum: totalPageNum,
      messages: messages,
    }
  }

  static userProfileHtmlToUserProfile(html){
    const $ = html.getCheerio()

    return {
      content: $('#profilecontent').html()
    }

  }

}
import * as HKEPC from '../../data/config/hkepc'
const cheerio = require('cheerio')
import {GeneralHtml} from '../model/general-html'
import * as URLUtils from '../../utils/url'

export default class Mapper{

  static apiSuccess(o) { return { message: o.message }}

  static htmlToCherrio(resp) {
    const html = new GeneralHtml(cheerio.load(resp.data))

    return html
      .removeIframe()
      .processImgUrl(HKEPC.imageUrl)
      .getCheerio()
  }

  static topicListHtmlToTopicList($) {


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

  static postListHtmlToPostListPage($,pageNum){
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
      pageNum: pageNum,
    }
  }

}
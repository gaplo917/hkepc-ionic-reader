const cheerio = require('cheerio')
import {GeneralHtml} from '../model/general-html'
import {HKEPCHtml} from '../model/hkepc-html'
import * as URLUtils from '../../utils/url'

export default class Mapper{

  static apiSuccess(o) { return { message: o.message }}

  static topicListHtmlToTopicList(html) {

    const $ = html.getCheerio()

    return $('#mainIndex > div').map((i, elem) => {
      const source = $(elem)

      const groupName = source.hasClass('group')
        ? source.find('a').text()
        : undefined

      const topicId = URLUtils.getQueryVariable(source.find('.forumInfo .caption').attr('raw-href'), 'fid')
      const topicName = source.find('.forumInfo .caption').text()
      const description = source.find('.forumInfo p').next().text()
      const image = source.find('.icon img').attr('raw-src')

      return {
        id: topicId,
        name: topicName,
        image: image,
        groupName: groupName,
        description: description.replace("最後發表", " -")
      }

    }).get()
  }

  static postListHtmlToPostListPage(html,pageNum){
    const $ = html.getCheerio()

    // only work for latest
    const searchId = URLUtils.getQueryVariable($('.pages_btns .pages a').first().attr('raw-href'),'searchid')

    const titles = $('#nav').text().split('»')
    const topicName = titles[titles.length - 1]
    const totalPageNumText = $('.pages_btns .pages .last').first().text() || $('.pages_btns .pages a').not('.next').last().text()
    const subTopicList = $('#subforum table h2 a').map((i,elem) => {
      const obj = $(elem)
      const name = obj.text()
      const id = URLUtils.getQueryVariable(obj.attr('raw-href'), 'fid')
      return {
        id: id,
        name: name
      }
    }).get()

    const postCategories = $('.threadtype a').map((i,elem) => {
          const obj = $(elem)
          return {
            id: URLUtils.getQueryVariable(obj.attr('raw-href'), 'typeid'),
            name: obj.text()
          }
        }).get()


    // only extract the number
    const totalPageNum = totalPageNumText
      ? totalPageNumText.match(/\d/g).join("")
      : 1

    const posts = $('.threadlist table tbody').map( (i, elem) => {
      const htmlId = $(elem).attr('id')

      const postSource = $(elem)
      // fall back for latest postUrl finding
      const postUrl = postSource.find('tr .subject span a').attr('raw-href') || /* latest post */postSource.find('tr .subject a').attr('raw-href')
      const postTitleImgUrl = postSource.find('tr .folder img').attr('raw-src')

      return {
        id: URLUtils.getQueryVariable(postUrl, 'tid'),
        topicId: URLUtils.getQueryVariable(postUrl, 'fid'),
        tag: postSource.find('tr .subject em a').text() || postSource.find('.forum a').text(),
        name: postSource.find('tr .subject span[id^=thread_] a ').text() || postSource.find('tr .subject > a ').text(),
        lastPost:{
          name: postSource.find('tr .lastpost cite a').text(),
          timestamp: postSource.find('tr .lastpost em a span').attr('title') || postSource.find('tr .lastpost em a').text()
        },
        author: {
          name: postSource.find('tr .author a').text()
        },
        count: {
          view: postSource.find('tr .nums em').text(),
          reply: postSource.find('tr .nums strong').text()
        },
        publishDate: postSource.find('tr .author em').text(),
        pageNum: pageNum,
        isSticky: htmlId ? htmlId.startsWith("stickthread") : false,
        isRead: postTitleImgUrl ? postTitleImgUrl.indexOf('new') > 0 : false,
        isLock: postTitleImgUrl ? postTitleImgUrl.indexOf('lock') > 0 : false
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
    const pageBackLink = $('.forumcontrol .pageback a').attr('raw-href')

    const topicId = URLUtils.getQueryVariable(pageBackLink,'fid')

    const isLock = $('.replybtn').text() ? false : true

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

    const messages = $('#postlist > div')
      .filter((i,elem) => {
        // fix HKEPC server rendering bug
        return elem.children.length > 0
      })
      .map((i, elem) => {

      let postSource = $(elem)

      const content = new HKEPCHtml(
        cheerio.load(postSource.find('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html() ||
          postSource.find('.postcontent > .defaultpost > .postmessage').html())
      ).getCheerio()

      content('#threadtitle').remove()
      content('.useraction').remove()
      content('blockquote').attr('ng-click', content('blockquote a').attr('ng-click'))
      content('blockquote a').attr('ng-click','')
      content('blockquote img').html('<div class="message-resolve"><i class="ion-ios-search-strong"></i> 點擊查看原文</div>')

      const rank = postSource.find('.postauthor > p > img').attr('alt')

      const avatarImage = postSource.find('.postauthor .avatar img')
      const rawAvatarImageUrl = avatarImage.attr('raw-src')

      // processed by general html (isAutoLoadImage features)
      const avatarImageUrl = avatarImage.attr('image-lazy-src')

      return {
        id: postSource.find('table').attr('id').replace('pid',''),
        pos: postSource.find('.postinfo strong a em').text(),
        createdAt: postSource.find('.posterinfo .authorinfo em span').attr('title') || postSource.find('.posterinfo .authorinfo em').text().replace('發表於 ',''),
        content : content.html(),
        type: 'POST_MESSAGE',
        post:{
          id: postId,
          topicId: topicId,
          title: postTitle,
          page: page,
        },
        author:{
          rank: rank ? rank.replace('Rank: ','') : 0,
          image: avatarImageUrl,
          uid: URLUtils.getQueryVariable(rawAvatarImageUrl,'uid'),
          name : postSource.find('.postauthor > .postinfo').text().trim(),
        }
      }

    }).get()


    return {
      title: postTitle,
      id: postId,
      topicId: topicId,
      totalPageNum: totalPageNum,
      messages: messages,
      isLock: isLock
    }
  }

  static userProfileHtmlToUserProfile(html){
    const $ = html.getCheerio()

    return {
      content: $('#profilecontent').html()
    }

  }

}
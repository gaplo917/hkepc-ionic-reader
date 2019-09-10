/**
 * Created by Gaplo917 on 30/1/2016.
 */
import {GeneralHtml} from './general-html'
import * as URLUtils from '../../utils/url'

export class HKEPCHtml extends GeneralHtml{

  constructor(cheerioSource) {
    super(cheerioSource);
    this.BASE_URL = `https://www.hkepc.com`
    this.BASE_FORUM_URL = `${this.BASE_URL}/forum`
    this.IMAGE_URL = 'https://www.hkepc.com/forum'
  }

  processEpcUrl(currentHash){

    this.source('a').each((i,e) => {
      const elm = this.source(e)
      // remove action attr on img
      elm.removeAttr('onload')
      elm.removeAttr('onclick')

      const url = elm.attr('href')

      // save it in raw-href
      elm.attr('raw-href',url)

      if(url && url.indexOf('redirect.php?') >= 0 && url.indexOf('goto=findpost') >= 0){
        const messageId = URLUtils.getQueryVariable(url,'pid')
        const postId = URLUtils.getQueryVariable(url,'ptid')

        elm.attr('href',``)
        elm.removeAttr('target')
        elm.attr('pid',messageId)
        elm.attr('ptid',postId)

        elm.attr('in-app-url',`#!/tab/topics//posts/${postId}/page/1`)

        elm.attr('ng-click',`vm.findMessage(${postId},${messageId})`)

      } else if(url && url.indexOf('redirect.php?') >= 0 && url.indexOf('goto=lastpost') >= 0){
        const postId = URLUtils.getQueryVariable(url,'tid')
        elm.removeAttr('target')
        elm.attr('tid',postId)

        elm.attr('href',`#!/tab/topics//posts/${postId}/page/1`)

      } else if (url && url.indexOf('forumdisplay.php') >= 0){
        const topicId = URLUtils.getQueryVariable(url,'fid')

        elm.removeAttr('target')

        elm.attr('href',`#!/tab/topics/${topicId}/page/1`)

      } else if(url && url.indexOf('viewthread.php?') >= 0){
        const postId = URLUtils.getQueryVariable(url,'tid')

        elm.removeAttr('target')

        // detect the tab
        elm.attr('href',`#!/tab/topics//posts/${postId}/page/1`)

      } else if(url && url.indexOf('space.php?') >= 0){
        // if(this.source(e).children('img').attr('src') == undefined){
        //   // confirm there are no image inside the link tag
        //   const urlText = this.source(e).text()
        //   const spanText = cheerio(`<span class="username">${urlText}</span>`)
        //   this.source(e).replaceWith(spanText)
        // }
      } else if(url && url.indexOf('logging.php') >= 0){
        elm.attr('href',`#!/tab/features/account`)

        elm.removeAttr('target')

      } else if(url && url.indexOf('attachment.php?') >= 0){
        // remove action attr on img
        elm.removeAttr('onload')
        elm.removeAttr('onclick')

        elm.attr('href','')
        elm.attr('target',`_system`)
        elm.attr('onclick',`window.open('${this.IMAGE_URL}/${url}', '_system', 'location=yes'); return false;`)

      } else if(url && !url.startsWith("http") && !url.startsWith('#') && !url.startsWith("//")) {
        // relative url
        elm.removeAttr('onload')
        elm.removeAttr('onclick')
        elm.removeAttr('onmouseover')

        elm.attr('href','')
        elm.attr('target',`_system`)
        elm.attr('onclick',`window.open('${this.BASE_FORUM_URL}/${url}', '_system', 'location=yes'); return false;`)
        elm.attr('data-href',`${this.BASE_FORUM_URL}/${url}`)

      } else {
        elm.attr('data-href',`${url}`)
      }

      // TODO: more rules needs to be applied here

    })

    return this
  }

  getLoggedInUserInfo(){
    return {
      username: this.source('#umenu > cite > a').text() || /* HKEPC 2.0 beta */this.source('header .userInfo span').text(),
      pmNotification: (this.source('#prompt_pm').text().match(/\d/g) || [] ) [0],
      postNotification: (this.source('#prompt_threads').text().match(/\d/g) || [] )[0],
      formhash: this.source('input[name=formhash]').attr('value')
    }
  }

}

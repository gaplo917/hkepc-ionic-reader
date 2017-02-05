/**
 * Created by Gaplo917 on 30/1/2016.
 */
import {GeneralHtml} from './general-html'
import * as URLUtils from '../../utils/url'
const cheerio = require('cheerio')

export class HKEPCHtml extends GeneralHtml{

  constructor(cheerioSource) {
    super(cheerioSource);
    this.BASE_URL = `http://www.hkepc.com`
    this.BASE_FORUM_URL = `${this.BASE_URL}/forum`
    this.IMAGE_URL = 'http://www.hkepc.com/forum'
  }

  processEpcUrl(currentHash){

    this.source('a').each((i,e) => {

      // remove action attr on img
      this.source(e).removeAttr('onload')
      this.source(e).removeAttr('onclick')

      const url = this.source(e).attr('href')

      // save it in raw-href
      this.source(e).attr('raw-href',url)

      if(url && url.indexOf('redirect.php?') >= 0 && url.indexOf('goto=findpost') >= 0){
        const messageId = URLUtils.getQueryVariable(url,'pid')
        const postId = URLUtils.getQueryVariable(url,'ptid')

        this.source(e).attr('href',``)
        this.source(e).removeAttr('target')
        this.source(e).attr('pid',messageId)
        this.source(e).attr('ptid',postId)

        if(currentHash.indexOf('/features') > 0){
          this.source(e).attr('in-app-url',`#/tab/features/topics//posts/${postId}/page/1`)
        } else {
          this.source(e).attr('in-app-url',`#/tab/topics//posts/${postId}/page/1`)
        }

        this.source(e).attr('ng-click',`vm.findMessage(${postId},${messageId})`)

      }
      else if (url && url.indexOf('forumdisplay.php') >= 0){
        const topicId = URLUtils.getQueryVariable(url,'fid')

        this.source(e).removeAttr('target')

        if(currentHash.indexOf('/features') > 0) {
          this.source(e).attr('href',`#/tab/features/topics/${topicId}/page/1`)

        } else {
          this.source(e).attr('href',`#/tab/topics/${topicId}/page/1`)
        }
      }
      else if(url && url.indexOf('viewthread.php?') >= 0){
        const postId = URLUtils.getQueryVariable(url,'tid')

        this.source(e).removeAttr('target')

        // detect the tab
        if(currentHash.indexOf('/features') > 0){
          this.source(e).attr('href',`#/tab/features/topics//posts/${postId}/page/1`)
        } else {
          this.source(e).attr('href',`#/tab/topics//posts/${postId}/page/1`)
        }

      }
      else if(url && url.indexOf('space.php?') >= 0){
        // if(this.source(e).children('img').attr('src') == undefined){
        //   // confirm there are no image inside the link tag
        //   const urlText = this.source(e).text()
        //   const spanText = cheerio(`<span class="username">${urlText}</span>`)
        //   this.source(e).replaceWith(spanText)
        // }
      }
      else if(url && url.indexOf('logging.php') >= 0){
        this.source(e).attr('href',`#/tab/features/account`)

        this.source(e).removeAttr('target')
      }
      else if(url && url.indexOf('attachment.php?') >= 0){
        // remove action attr on img
        this.source(e).removeAttr('onload')
        this.source(e).removeAttr('onclick')

        this.source(e).attr('href','')
        this.source(e).attr('target',`_system`)
        this.source(e).attr('onclick',`window.open('${this.IMAGE_URL}/${url}', '_system', 'location=yes'); return false;`)
      }
      else if(url && !url.startsWith("http") && !url.startsWith('#') && !url.startsWith("//")) {
        // relative url
        this.source(e).removeAttr('onload')
        this.source(e).removeAttr('onclick')
        this.source(e).removeAttr('onmouseover')

        this.source(e).attr('href','')
        this.source(e).attr('target',`_system`)
        this.source(e).attr('onclick',`window.open('${this.BASE_FORUM_URL}/${url}', '_system', 'location=yes'); return false;`)
        this.source(e).attr('data-href',`${this.BASE_FORUM_URL}/${url}`)
      } else {
        this.source(e).attr('data-href',`${url}`)
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
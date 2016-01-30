/**
 * Created by Gaplo917 on 30/1/2016.
 */
import {GeneralHtml} from './general-html'
import * as URLUtils from "../../utils/url"
var cheerio = require('cheerio')

export class HKEPCHtml extends GeneralHtml{

  constructor(cheerioSource) {
    super(cheerioSource);
  }

  processEpcUrl(){

    this.source('a').each((i,e) => {

      // remove action attr on img
      this.source(e).removeAttr('onload')
      this.source(e).removeAttr('onclick')

      const url = this.source(e).attr('href')

      if(url && url.indexOf('redirect.php?') >= 0 && url.indexOf('goto=findpost') >= 0){
        const messageId = URLUtils.getQueryVariable(url,'pid')
        const postId = URLUtils.getQueryVariable(url,'ptid')

        this.source(e).attr('href',`#/tab/topics/findMessage/${postId}/${messageId}`)
        this.source(e).removeAttr('target')

      }
      else if(url && url.indexOf('viewthread.php?') >= 0){
        const postId = URLUtils.getQueryVariable(url,'tid')
        this.source(e).attr('href',`#/tab/topics//posts/${postId}/page/1`)
        this.source(e).removeAttr('target')
      }
      else if(url && url.indexOf('space.php?') >= 0){
        const urlText = this.source(e).text()
        const spanText = cheerio(`<span class="username">${urlText}</span>`)
        this.source(e).replaceWith(spanText)
      }

      // TODO: more rules needs to be applied here

    })

    return this
  }
}
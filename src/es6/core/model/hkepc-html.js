/**
 * Created by Gaplo917 on 30/1/2016.
 */
import {GeneralHtml} from './general-html'
import * as URLUtils from "../../utils/url"

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

      if(url && url.indexOf('redirect.php?goto=findpost') >= 0){
        const messageId = URLUtils.getQueryVariable(url,'pid')
        const postId = URLUtils.getQueryVariable(url,'ptid')

        this.source(e).attr('href',`#/tab/topics/findMessage/${postId}/${messageId}`)
        this.source(e).removeAttr('target')

        console.log(url)

      }


    })

    return this
  }
}
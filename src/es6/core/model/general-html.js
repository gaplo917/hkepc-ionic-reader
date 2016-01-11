/**
 * Created by Gaplo917 on 10/1/2016.
 */
import * as URLUtils from "../../utils/url"

export class GeneralHtml{

  constructor(cheerioSource) {
    this.source = cheerioSource

    // remove all the script tags
    this.source('script').remove()
  }

  removeIframe(){
    this.source('iframe').remove()
    return this;
  }

  processImgUrl(imagePrefix){
    this.source('img').each((i,e) => {

      const lazyImg = this.source(e).attr('file')

      if(lazyImg){
        //console.log('lazy',lazyImg)
        this.source(e).attr('src',lazyImg)
      }

      const imgSrc = this.source(e).attr('src')

      if(URLUtils.isRelativeUrl(imgSrc)){
        //console.log('relative',imgSrc)
        this.source(e).attr('src',`${imagePrefix}${imgSrc}`)
      }

      // remove action attr on img
      this.source(e).removeAttr('onload')
      this.source(e).removeAttr('onclick')

    })

    return this;
  }

  getTitle(){
    return this.source('title').text()
  }

  getCheerio(){
    return this.source
  }

  html(){
    return this.source.html()
  }

  text(){
    return this.source.text()
  }

}
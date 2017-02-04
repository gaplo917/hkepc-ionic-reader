/**
 * Created by Gaplo917 on 10/1/2016.
 */
import * as URLUtils from '../../utils/url'

export class GeneralHtml{

  constructor(cheerioSource) {
    this.source = cheerioSource

    // remove all the script tags
    this.removeScripts()
    this.removeIframe()
  }

  removeScripts(){
    this.source('script').remove()

    return this
  }

  removeIframe(){
    this.source('iframe').remove()

    return this
  }

  processImgUrl(imagePrefix){
    this.source('img').each((i,e) => {

      const lazyImg = this.source(e).attr('file')

      if(lazyImg){
        this.source(e).attr('src',lazyImg)
      }

      const imgSrc = this.source(e).attr('src')

      if(URLUtils.isRelativeUrl(imgSrc)){
        this.source(e).attr('src',`${imagePrefix}/${imgSrc}`)
      } else if(imgSrc.indexOf('//') == 0) {
        this.source(e).attr('src',`http:${imgSrc}`)
      }

      this.source(e).attr('raw-src', imgSrc)

      // remove action attr on img
      this.source(e).removeAttr('onload')
      this.source(e).removeAttr('onclick')
      this.source(e).removeAttr('onmouseover')

    })

    return this
  }

  processImageToLazy(){
    this.source('img').each((i,e) => {
      const imgSrc = this.source(e).attr('src')
      this.source(e).attr('raw-src',imgSrc)

      if(imgSrc && !imgSrc.endsWith('.gif')){
        this.source(e).attr('image-lazy-src',imgSrc)
        this.source(e).attr('image-lazy-distance-from-bottom-to-load',"400")
        this.source(e).attr('lazy-scroll-resize',"true")
        this.source(e).removeAttr('src')
        this.source(e).removeAttr('alt')
      }
    })

    return this
  }

  processExternalUrl(){

    this.source('a').each((i,e) => {

      const url = this.source(e).attr('href')

      if(url && !url.startsWith('#')){
        // remove action attr on img
        this.source(e).removeAttr('onload')
        this.source(e).removeAttr('onclick')
        this.source(e).removeAttr('onmouseover')

        this.source(e).attr('href','')
        this.source(e).attr('target',`_system`)
        this.source(e).attr('onclick',`window.open('${url}', '_system', 'location=yes'); return false;`)
        this.source(e).attr('raw-href', url)

      }


    })

    return this

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
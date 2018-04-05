/**
 * Created by Gaplo917 on 10/1/2016.
 */
import * as URLUtils from '../../utils/url'
const uuid = require('uuid-v4');

const DEFAULT_IMAGE_PLACEHOLDER = "img/default-placeholder.png"
const DEFAULT_AVATAR_PLACEHOLDER = "img/default-avatar.png"
const DEFAULT_DEAD_IMAGE_PLACEHOLDER = "img/default-dead-placeholder.png"

export class GeneralHtml{
  // copied from cloudflare script
  static decodeCloudflareEmailProtection(e, t = 0, r, n) {
    for (r = '', n = '0x' + e.substr(t, 2) | 0, t += 2; t < e.length; t += 2) {
      r += String.fromCharCode('0x' + e.substr(t, 2) ^ n);
    }
    return r
  }

  constructor(cheerioSource) {
    this.source = cheerioSource

    // remove all the script tags
    this.removeScripts()
    this.removeAds()
    this.handleCloudflareEmailProtection()
  }

  handleCloudflareEmailProtection() {

    this.source('.__cf_email__').each((i,e) => {
      const obfElement = this.source(e)
      const dataCFEmail = obfElement.attr('data-cfemail')
      obfElement.replaceWith(GeneralHtml.decodeCloudflareEmailProtection(dataCFEmail))
    })
  }

  removeScripts(){
    this.source('script').remove()

    return this
  }

  removeAds(){
    this.source('.adv').remove()

    return this
  }

  processImgUrl(imagePrefix){
    this.source('img').each((i,e) => {
      const elm = this.source(e)
      const lazyImg = elm.attr('file')

      if(lazyImg){
        this.source(e).attr('src',lazyImg)
      }

      const imgSrc = elm.attr('src')

      if(URLUtils.isRelativeUrl(imgSrc)){
        elm.attr('src',`${imagePrefix}/${imgSrc}`)
      } else if(imgSrc.indexOf('//') == 0) {
        elm.attr('src',`http:${imgSrc}`)
      }

      elm.attr('raw-src', imgSrc)

      // remove action attr on img
      elm.removeAttr('onload')
      elm.removeAttr('onclick')
      elm.removeAttr('onmouseover')

    })

    return this
  }

  processImageToLazy(isAutoLoadImage = true){
    this.source('img').each((i,e) => {
      const elm = this.source(e)
      const imgSrc = this.source(e).attr('src')
      const uid = uuid()
      elm.attr('raw-src',imgSrc)
      elm.attr('id', uid)
      elm.attr('onError', `this.onerror=null;this.src='${DEFAULT_DEAD_IMAGE_PLACEHOLDER}';`)

      if(imgSrc && !imgSrc.endsWith('.gif')){
        elm.attr('image-lazy-src', imgSrc)
        elm.attr('image-lazy-distance-from-bottom-to-load',"0")
        elm.attr('image-lazy-loader',"android")
        elm.removeAttr('src')
        elm.removeAttr('alt')
        elm.attr('ng-click',`vm.openImage('${uid}', '${imgSrc}')`)
      }

      if(!isAutoLoadImage && !imgSrc.endsWith('.gif')){
        elm.removeAttr('image-lazy-src')
        elm.attr('src', DEFAULT_IMAGE_PLACEHOLDER)
        elm.attr('ng-click',`vm.loadLazyImage('${uid}', '${imgSrc}')`)
      }

      if(!isAutoLoadImage && imgSrc.indexOf("avatar") >= 0){
        elm.attr('image-lazy-src', DEFAULT_AVATAR_PLACEHOLDER)
      }
    })

    return this
  }

  processExternalUrl(){

    this.source('a').each((i,e) => {
      const elm = this.source(e)

      const url = this.source(e).attr('href')

      if(url && !url.startsWith('#') && url.indexOf(DEFAULT_IMAGE_PLACEHOLDER) === -1){
        // remove action attr on img
        elm.removeAttr('onload')
        elm.removeAttr('onclick')
        elm.removeAttr('onmouseover')

        elm.attr('href','')
        elm.attr('target',`_system`)
        elm.attr('onclick',`window.open('${url}', '_system', 'location=yes'); return false;`)
        elm.attr('raw-href', url)

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
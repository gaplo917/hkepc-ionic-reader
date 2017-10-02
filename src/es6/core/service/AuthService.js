/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
const cheerio = require('cheerio')

export class AuthService {
  static get NAME() { return 'AuthService' }

  static get DI() {
    return (LocalStorageService,$http,ngToast,rx) => new AuthService(LocalStorageService,$http,ngToast,rx)
  }

  constructor(LocalStorageService,$http,ngToast,rx) {
    this.localStorageService = LocalStorageService
    this.http = $http
    this.ngToast = ngToast
    this.rx = rx
  }

  saveAuthority(authority) {
    // remove the password before save
    delete authority['password']

    return this.localStorageService.setObject('authority',authority)
  }

  removeAuthority(){
   return this.localStorageService.setObject('authority',{})
  }

  getUsername() {
    return this.localStorageService.getObject('authority')
      .map(authority => {
        if(authority && authority.username){
          return authority.username.trim()
        }
        else {
          return undefined
        }
      })
  }

  isLoggedIn() {
    return this.rx.Observable.combineLatest(
      this.localStorageService.get(HKEPC.auth.id),
      this.localStorageService.get(HKEPC.auth.token),
      this.localStorageService.get(HKEPC.auth.expire),
      (id, token, expire) => {
        return id && token && new Date().getTime() < parseInt(expire)
      }
    )
  }

  login (authority,cb) {
    if(authority && authority.username && authority.password){
      console.log('[AuthService]','Request login')

      if(WebViewJavascriptBridge){
        WebViewJavascriptBridge.callHandler('ObjC Echo', {
          method: 'POST',
          url: HKEPC.forum.login(),
          data: {
            username: authority.username,
            password: authority.password,
            cookietime: 2592000
          }
        }, (data) => {
          const $ = cheerio.load(data)
          const currentUsername = $('#umenu > cite').text()
          const formhash = $(`input[name='formhash']`).attr('value')

          if(currentUsername){
            const expire = new Date().getTime() + 2592000000
            const expireDate = new Date(expire)
            this.localStorageService.set(HKEPC.auth.id,"dummy_val_for_non_proxied_client")
            this.localStorageService.set(HKEPC.auth.token,"dummy_val_for_non_proxied_client")
            this.localStorageService.set(HKEPC.auth.expire,expire)
            this.localStorageService.set(HKEPC.auth.formhash,formhash)

            this.ngToast.success(`<i class="ion-ios-checkmark"> ${currentUsername} 登入成功! </i>`)

            if(cb) cb(null,currentUsername)
          } else {
            this.ngToast.danger(`<i class="ion-alert-circled"> 登入失敗! </i>`)
            cb("Fail!")
          }
        })
      }
      else {

        this.http({
          method: "POST",
          url: HKEPC.forum.login(),
          data: `username=${authority.username}&password=${authority.password}&cookietime=2592000`,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((resp) => {

          if(URLUtils.isProxy()){
            const sidKV = resp.data.find(x => x.startsWith(`${HKEPC.auth.id}=`))
            const authKV = resp.data.find(x => x.startsWith(`${HKEPC.auth.token}=`))

            if(sidKV && authKV){
              const sidValue = sidKV.split(';')[0].split('=')[1]
              const authValue = authKV.split(';')[0].split('=')[1]
              const authExpireValue = authKV.split(';')[1].split('=')[1]

              if(sidValue && authValue) {
                const expire = new Date().getTime() + 2592000000

                this.localStorageService.set(HKEPC.auth.id,sidValue)
                this.localStorageService.set(HKEPC.auth.token,authValue)
                this.localStorageService.set(HKEPC.auth.expire,expire)

                this.ngToast.success(`<i class="ion-ios-checkmark"> ${authority.username} 登入成功! </i>`)

                if(cb) cb(null,authority.username)
              }
            } else{
              this.ngToast.danger(`<i class="ion-alert-circled"> 登入失敗! </i>`)
              cb("Fail!")
            }
          } else {
            const $ = cheerio.load(resp.data)
            const currentUsername = $('#umenu > cite').text()
            const formhash = $(`input[name='formhash']`).attr('value')

            if(currentUsername){
              const expire = new Date().getTime() + 2592000000
              const expireDate = new Date(expire)
              this.localStorageService.set(HKEPC.auth.id,"dummy_val_for_non_proxied_client")
              this.localStorageService.set(HKEPC.auth.token,"dummy_val_for_non_proxied_client")
              this.localStorageService.set(HKEPC.auth.expire,expire)
              this.localStorageService.set(HKEPC.auth.formhash,formhash)

              this.ngToast.success(`<i class="ion-ios-checkmark"> ${currentUsername} 登入成功! </i>`)

              if(cb) cb(null,currentUsername)
            } else {
              this.ngToast.danger(`<i class="ion-alert-circled"> 登入失敗! </i>`)
              cb("Fail!")
            }
          }

        })
      }

    }
  }

  logout () {
    this.localStorageService.set(HKEPC.auth.id,undefined)
    this.localStorageService.set(HKEPC.auth.token,undefined)
    this.localStorageService.set(HKEPC.auth.expire,undefined)
    this.removeAuthority()

    // must be success
    this.http.get(HKEPC.forum.logout(this.localStorageService.get(HKEPC.auth.formhash))).then((resp) => {
      // TODO: do some checking?
    })

  }

}


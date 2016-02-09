/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export var AuthService = {
  name: 'authService',

  impl: ['$localstorage','$http','ngToast',function ($localstorage,$http,ngToast) {

    return {
      saveAuthority: (authority) =>{
        "use strict";
        // remove the password before save
        delete authority['password']

        $localstorage.setObject('authority',authority)
      },
      removeAuthority: () => {
        $localstorage.setObject('authority',{})
      },
      getUsername: () =>{
        "use strict";
        return $localstorage.getObject('authority').username
      },
      isLoggedIn: function() {
        "use strict";
        return $localstorage.get(HKEPC.auth.id) &&
            $localstorage.get(HKEPC.auth.token) &&
            new Date().getTime() < parseInt($localstorage.get(HKEPC.auth.expire))
      },
      login: (authority,cb) => {
        "use strict";
        if(authority && authority.username && authority.password){
          console.log('[AuthService]','Request login')

          $http({
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
                  $localstorage.set(HKEPC.auth.id,sidValue)
                  $localstorage.set(HKEPC.auth.token,authValue)
                  $localstorage.set(HKEPC.auth.expire,new Date(authExpireValue).getTime())

                  ngToast.success(`<i class="ion-ios-checkmark"> ${authority.username} 登入成功! </i>`)

                  if(cb) cb(null,authority.username)
                }
              } else{
                ngToast.danger(`<i class="ion-alert-circled"> 登入失敗! </i>`)
                cb("Fail!")
              }
            } else {
              const $ = cheerio.load(resp.data)
              const currentUsername = $('#umenu > cite').text()
              const formhash = $(`input[name='formhash']`).attr('value')

              if(currentUsername){
                const expire = new Date().getTime() + 2592000
                const expireDate = new Date(expire)
                $localstorage.set(HKEPC.auth.id,"dummy_val_for_non_proxied_client")
                $localstorage.set(HKEPC.auth.token,"dummy_val_for_non_proxied_client")
                $localstorage.set(HKEPC.auth.expire,expire)
                $localstorage.set(HKEPC.auth.formhash,formhash)

                ngToast.success(`<i class="ion-ios-checkmark"> ${currentUsername} 登入成功! </i>`)

                if(cb) cb(null,currentUsername)
              } else {
                ngToast.danger(`<i class="ion-alert-circled"> 登入失敗! </i>`)
                cb("Fail!")
              }
            }

          })
        }
      },
      logout: () => {
        "use strict";
        $localstorage.set(HKEPC.auth.id,undefined)
        $localstorage.set(HKEPC.auth.token,undefined)
        $localstorage.set(HKEPC.auth.expire,undefined)

        // must be success
        $http.get(HKEPC.forum.logout($localstorage.get(HKEPC.auth.formhash))).then((resp) => {
          ngToast.success(`<i class="ion-ios-checkmark"> 成功登出! </i>`)
        })

      }
    }
  }]

}
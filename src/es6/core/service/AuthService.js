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

  impl: ['$localstorage','$http','$cookies','ngToast',function ($localstorage,$http,$cookies,ngToast) {

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
        return $cookies.get(HKEPC.auth.id) &&
            $cookies.get(HKEPC.auth.token) &&
            new Date().getTime() < $cookies.get(HKEPC.auth.expire)
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

            const sidKV = resp.data.find(x => x.startsWith(`${HKEPC.auth.id}=`))
            const authKV = resp.data.find(x => x.startsWith(`${HKEPC.auth.token}=`))

            if(sidKV && authKV){
              const sidValue = sidKV.split(';')[0].split('=')[1]
              const authValue = authKV.split(';')[0].split('=')[1]
              const authExpireValue = authKV.split(';')[1].split('=')[1]

              if(sidValue && authValue) {
                $cookies.put(HKEPC.auth.id,sidValue,{expires: authExpireValue})
                $cookies.put(HKEPC.auth.token,authValue,{expires: authExpireValue})
                $cookies.put(HKEPC.auth.expire,new Date(authExpireValue).getTime(),{expires: authExpireValue})

                ngToast.success(`<i class="ion-ios-checkmark"> ${authority.username} 登入成功! </i>`)

                if(cb) cb(null,authority.username)
              }
            } else{
              ngToast.danger(`<i class="ion-alert-circled"> 登入失敗! </i>`)
              cb("Fail!")
            }

          })
        }
      },
      logout: () => {
        "use strict";
        $cookies.remove(HKEPC.auth.id)
        $cookies.remove(HKEPC.auth.token)
        $cookies.remove(HKEPC.auth.expire)
      }
    }
  }]

}
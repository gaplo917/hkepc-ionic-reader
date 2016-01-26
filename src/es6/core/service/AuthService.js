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

  impl: ['$localstorage','$http',function ($localstorage,$http) {

    return {
      saveAuthority: function(authority){
        "use strict";
        $localstorage.setObject('authority',authority)
      },
      removeAuthority: function () {
        $localstorage.setObject('authority',{})
      },
      loginFromDb: function(cb) {
        "use strict";

        const authority = $localstorage.getObject('authority')

        if(Object.keys(authority).length > 0){
          console.log('[AuthService]','Login from DB')
          this.login(authority, cb)
        } else {
          if(cb) cb('fail')
        }
      },
      login: function(authority,cb){
        "use strict";
        if(authority){
          console.log('[AuthService]','Request login')

          $http({
            method: "POST",
            url: HKEPC.forum.login(),
            data: `username=${authority.username}&password=${authority.password}&cookietime=2592000`,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).then((resp) => {
            console.log(resp)
            const html = new GeneralHtml(cheerio.load(resp.data))

            let $ = html
                .removeIframe()
                .processImgUrl(HKEPC.baseUrl)
                .getCheerio()

            const currentUsername = $('#umenu > cite').text()

            if(currentUsername){
              console.log('[AuthService]','Login success')

              if(cb) cb(null,currentUsername)

            } else {
              console.log('[AuthService]','Login fail')

              this.removeAuthority()
              alert($('.alert_info').text())
            }
          }, (err) => {
            alert(err)
          })
        }
      }
    }
  }],

}
/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/FindMessageRequest"
import {NotificationBadgeUpdateRequest} from "../model/NotificationBadgeUpdateRequest"
import {ChangeThemeRequest} from "../model/ChangeThemeRequest"
import {ChangeFontSizeRequest} from "../model/ChangeFontSizeRequest"

const cheerio = require('cheerio')

export class FeatureRouteController{
  static get STATE() { return 'tab.features'}
  static get NAME() { return 'FeatureRouteController'}
  static get CONFIG() { return {
    url: '/features',
    views: {
      'tab-features': {
        templateUrl: 'templates/features/features.route.html',
        controller: FeatureRouteController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,$rootScope, $http, AuthService,$state,$sce,ngToast,LocalStorageService){

    this.http = $http
    this.scope = $scope
    this.rootScope = $rootScope
    this.sce = $sce
    this.state = $state
    this.ngToast = ngToast
    this.localStorageService = LocalStorageService
    this.isLoggedIn = false

    this.localStorageService.get('theme').subscribe(data => {
      this.darkTheme = data == 'dark'
    })
    this.localStorageService.get('fontSize').subscribe(data => {
      this.fontSize = data || "100"
    })

    this.authService = AuthService

    this.cleanBadgeUpdateListener = $rootScope.$on(NotificationBadgeUpdateRequest.NAME,(e,req) => {
      if(req instanceof NotificationBadgeUpdateRequest) {
        console.debug(`[${FeatureRouteController.NAME}] Received NotificationBadgeUpdateRequest`)

        console.log(req.notification)
        this.notification = req.notification
      }
    })

    $scope.$on('$ionicView.enter', (e) => {

      this.localStorageService.getObject('notification').subscribe( data => {
        this.notification = data
      })


      this.authService.isLoggedIn().subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn
        if(isLoggedIn) {
          this.registerOnChangeForumStyle()
        }
      })


    })
  }

  registerOnChangeForumStyle(){

    this.http.get(HKEPC.forum.settings())
      .then((resp) => {
        let $ = cheerio.load(resp.data)
        let form = $(`form[name='reg']`)
        let formSource = cheerio.load(form.html())
        const relativeUrl = form.attr('action')
        const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}`

        const formInputs = formSource(`input[type='hidden'], input[checked='checked'], #editsubmit, select`).not(`select[name='styleidnew']`).map((i,elem) => {
          const k = formSource(elem).attr('name')
          const v = formSource(elem).attr('value') || formSource(elem).find(`option[selected='selected']`).attr('value') || 0

          return `${k}=${encodeURIComponent(v)}`
        }).get()

        $(`select[name='styleidnew'] option`).each((i,elem) => {
          const obj = $(elem)
          const isSelected = obj.attr('selected') == 'selected'
          const value = obj.attr('value')
          const name = obj.text()

          if(isSelected){
            this.forumStyle = value
          }
        })

        this.onChangeForumStyle = (newStyle) => {

          const postData = [
            `styleidnew=${newStyle}`,
            formInputs.join('&')
          ].join('&')

          // Post to the server
          this.http({
            method: "POST",
            url : postUrl,
            data : postData,
            headers : {'Content-Type':'application/x-www-form-urlencoded'}
          }).then((resp) => {

            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功更改！</i>`)
          })
        }

      })
  }

  onDarkTheme(bool){
    const theme = bool? 'dark' : 'default'
    this.scope.$emit(ChangeThemeRequest.NAME, new ChangeThemeRequest(theme))
  }

  onResizeFont(size) {
    this.scope.$emit(ChangeFontSizeRequest.NAME, new ChangeFontSizeRequest(size))
  }


}
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
import {HideUsernameRequest} from "../model/HideUsernameRequest"

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

  constructor($scope,$rootScope, apiService, AuthService,$state,$sce,ngToast,LocalStorageService){

    this.apiService = apiService
    this.scope = $scope
    this.rootScope = $rootScope
    this.sce = $sce
    this.state = $state
    this.ngToast = ngToast
    this.localStorageService = LocalStorageService
    this.isLoggedIn = false

    this.localStorageService.get('loadImageMethod').subscribe(loadImageMethod => {
      this.isAutoLoadImage = loadImageMethod !== 'block'
    })

    this.localStorageService.get('theme').subscribe(data => {
      this.darkTheme = data == 'dark'
    })

    this.localStorageService.get('fontSize').subscribe(data => {
      this.fontSize = data || "100"
    })

    this.localStorageService.get('hideUsername').subscribe(data => {
        this.hideUsername = String(data) == 'true'
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

    this.apiService.settings()
      .safeApply(this.scope, (resp) => {
        let $ = cheerio.load(resp.data)
        let form = $(`form[name='reg']`)
        let formSource = cheerio.load(form.html())
        const relativeUrl = form.attr('action')
        const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}`

        const formInputs = {}

        formSource(`input[type='hidden'], input[checked='checked'], #editsubmit, select`).not(`select[name='styleidnew']`).map((i,elem) => {
          const k = formSource(elem).attr('name')
          const v = formSource(elem).attr('value') || formSource(elem).find(`option[selected='selected']`).attr('value') || 0

          formInputs[k] = encodeURIComponent(v)
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

          // Post to the server
          this.apiService.dynamicRequest({
            method: "POST",
            url : postUrl,
            data : {
              styleidnew: newStyle,
              ...formInputs
            },
            headers : {'Content-Type':'application/x-www-form-urlencoded'}
          }).safeApply(this.scope, (resp) => {

            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功更改！</i>`)
          }).subscribe()
        }

      }).subscribe()
  }

  onDarkTheme(bool){
    const theme = bool? 'dark' : 'default'
    this.scope.$emit(ChangeThemeRequest.NAME, new ChangeThemeRequest(theme))
  }

  onResizeFont(size) {
    this.scope.$emit(ChangeFontSizeRequest.NAME, new ChangeFontSizeRequest(size))
  }

  onDev(){
    this.ngToast.warning({
      dismissOnTimeout: false,
      content:`<i class="ion-ios-time"> 功能待開發中! <br/> 如你希望作者能盡快加入此功能，可考慮捐款支持作者。</i>`
    })
  }

  onIsAutoLoadImage(isAutoLoadImage){
    const loadImageMethod = isAutoLoadImage ? 'auto' : 'block'

    this.localStorageService.set('loadImageMethod', loadImageMethod)
  }

  onHideUsername(hidden){
    this.scope.$emit(HideUsernameRequest.NAME, new HideUsernameRequest(hidden))
  }
}
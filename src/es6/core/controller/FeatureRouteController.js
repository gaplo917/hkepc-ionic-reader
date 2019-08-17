/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import {
  NotificationBadgeUpdateRequest,
  ChangeThemeRequest,
  ChangeFontSizeRequest,
  MHeadFixRequest
} from '../model/requests'
import swal from 'sweetalert2'
import { NativeUpdateNotificationRequest } from '../bridge/requests'

const cheerio = require('cheerio')

export class FeatureRouteController {
  static get STATE () { return 'tab.features' }

  static get NAME () { return 'FeatureRouteController' }

  static get CONFIG () {
    return {
      url: '/features',
      views: {
        main: {
          templateUrl: 'templates/features/features.route.html',
          controller: FeatureRouteController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, apiService, AuthService, $state, $sce, ngToast, LocalStorageService, observeOnScope, $rootScope) {
    this.apiService = apiService
    this.scope = $scope
    this.sce = $sce
    this.state = $state
    this.ngToast = ngToast
    this.localStorageService = LocalStorageService
    this.isLoggedIn = false
    this.signature = true

    observeOnScope($scope, 'vm.isAutoLoadImage')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        const loadImageMethod = newValue ? 'auto' : 'block'

        this.localStorageService.set('loadImageMethod', loadImageMethod)
      })

    observeOnScope($scope, 'vm.signature')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.localStorageService.set('signature', newValue ? 'true' : 'false')
      })

    observeOnScope($scope, 'vm.fontSize')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.scope.$emit(ChangeFontSizeRequest.NAME, new ChangeFontSizeRequest(newValue))
      })

    observeOnScope($scope, 'vm.darkTheme')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.scope.$emit(ChangeThemeRequest.NAME, new ChangeThemeRequest(newValue))
      })

    observeOnScope($scope, 'vm.mHeadFix')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.scope.$emit(MHeadFixRequest.NAME, new MHeadFixRequest(newValue))
      })

    this.localStorageService.get('loadImageMethod').safeApply($scope, loadImageMethod => {
      this.isAutoLoadImage = loadImageMethod !== 'block'
    }).subscribe()

    this.localStorageService.get('theme').safeApply($scope, data => {
      this.darkTheme = data || 'default'
    }).subscribe()

    this.localStorageService.get('fontSize').safeApply($scope, data => {
      this.fontSize = data || '100'
    }).subscribe()

    this.localStorageService.get('signature').safeApply($scope, data => {
      if (data) {
        this.signature = String(data) === 'true'
      }
    }).subscribe()

    this.localStorageService.get('mHeadFix').safeApply($scope, data => {
      if (data) {
        this.mHeadFix = String(data) === 'true'
      }
    }).subscribe()

    this.authService = AuthService

    $rootScope.$eventToObservable(NotificationBadgeUpdateRequest.NAME)
      .filter(([event, req]) => req instanceof NotificationBadgeUpdateRequest)
      .safeApply($scope, ([event, req]) => {
        this.notification = req.notification
      })
      .subscribe()

    $rootScope.$eventToObservable(NativeUpdateNotificationRequest.NAME)
      .filter(([event, req]) => req instanceof NativeUpdateNotificationRequest)
      .safeApply($scope, ([event, req]) => {
        this.notification = req.notification
      })
      .subscribe()

    $scope.$on('$ionicView.loaded', (e) => {
      this.localStorageService.getObject('notification').subscribe(data => {
        this.notification = data
      })

      this.authService.isLoggedIn().safeApply($scope, isLoggedIn => {
        this.isLoggedIn = isLoggedIn
        if (isLoggedIn) {
          this.registerOnChangeForumStyle()
        }
      }).subscribe()
    })
  }

  registerOnChangeForumStyle () {
    // TODO: move to web-worker
    this.apiService.settings()
      .safeApply(this.scope, (resp) => {
        const $ = cheerio.load(resp.data)
        const form = $(`form[name='reg']`)
        const formSource = cheerio.load(form.html() || '')
        const relativeUrl = form.attr('action')
        const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}`

        const formInputs = {}

        formSource(`input[type='hidden'], input[checked='checked'], #editsubmit, select`).not(`select[name='styleidnew']`).map((i, elem) => {
          const k = formSource(elem).attr('name')
          const v = formSource(elem).attr('value') || formSource(elem).find(`option[selected='selected']`).attr('value') || 0

          formInputs[k] = encodeURIComponent(v)
        }).get()

        $(`select[name='styleidnew'] option`).each((i, elem) => {
          const obj = $(elem)
          const isSelected = obj.attr('selected') === 'selected'
          const value = obj.attr('value')
          // const name = obj.text()

          if (isSelected) {
            this.forumStyle = value
          }
        })

        this.onChangeForumStyle = (newStyle) => {
          const spinnerHtml = `
          <div>
              <div class="text-center">傳送到 HKEPC 伺服器中</div>
          </div>
        `

          swal({
            animation: false,
            html: spinnerHtml,
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false
          })

          swal.showLoading()

          // Post to the server
          this.apiService.dynamicRequest({
            method: 'POST',
            url: postUrl,
            data: {
              styleidnew: newStyle,
              ...formInputs
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).safeApply(this.scope, (resp) => {
            swal({
              animation: false,
              title: '成功更改',
              text: '',
              type: 'success'
            })
          }).subscribe()
        }
      }).subscribe()
  }

  doRefresh () {
    this.registerOnChangeForumStyle()
    this.apiService.checkPM()
      .flatMap(() => this.apiService.memberCenter())
      .subscribe()
  }
}

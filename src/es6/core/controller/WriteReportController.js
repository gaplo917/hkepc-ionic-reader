import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import swal from 'sweetalert2'
import { Bridge } from '../bridge/Bridge'

export class WriteReportController {
  static get STATE () { return 'tab.report-message' }

  static get NAME () { return 'WriteReportController' }

  static get CONFIG () {
    return {
      url: '/report/:topicId/:postId/:messageId?meta=',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/write-report.html',
          controller: WriteReportController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $state, $stateParams, $ionicHistory, $ionicPopover, ngToast, apiService, $ionicPopup, $rootScope, $compile, LocalStorageService) {
    this.scope = $scope
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.reason = ''
    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.messageId = $stateParams.messageId
    this.meta = JSON.parse($stateParams.meta || '{}')
    this.apiService = apiService
    this.ngToast = ngToast

    $scope.$on('$ionicView.loaded', (e) => {
      this.ionicSignature = HKEPC.signature({
        androidVersion: Bridge.isAndroidNative() ? $scope.nativeVersion : null,
        iosVersion: Bridge.isiOSNative() ? $scope.nativeVersion : null
      })
      // fetch the epc data for native App
      this.preFetchContent().subscribe()
    })
  }

  preFetchContent () {
    return this.apiService.getReportDialog(this.topicId, this.postId, this.messageId)
      .safeApply(this.scope, ({ actionUrl, hiddenFormInputs }) => {
        this.actionUrl = actionUrl

        this.hiddenFormInputs = hiddenFormInputs
      })
  }

  doReport () {
    const { reason, ionicSignature } = this

    if (reason) {
      const { actionUrl, hiddenFormInputs } = this

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
        url: actionUrl,
        data: {
          ...hiddenFormInputs,
          reason: `${reason}\n\n${ionicSignature}`
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).flatMapApiFromCheerioworker('responseContainText', { text: '報告', isXml: true })
        .safeApply(this.scope, ({ responseText, result }) => {
          if (result) {
            swal.close()

            this.ngToast.success('<i class="ion-ios-checkmark"> 成功報告！</i>')

            this.onBack()
          } else {
            swal({
              animation: false,
              title: '發佈失敗',
              text: `HKEPC 傳回:「${responseText}」`,
              type: 'error',
              confirmButtonText: '確定'
            })
          }
        }).subscribe(
          () => {},
          () => swal({
            animation: false,
            title: '發佈失敗',
            text: '網絡異常，請重新嘗試！',
            type: 'error',
            confirmButtonText: '確定'
          })
        )
    } else {
      this.ngToast.danger('<i class="ion-alert-circled"> 標題或內容不能空白！</i>')
    }
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true
      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }
}

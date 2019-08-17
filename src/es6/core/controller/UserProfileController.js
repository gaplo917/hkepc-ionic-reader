import * as Controllers from './index'
import { XMLUtils } from '../../utils/xml'
import * as _ from 'lodash'
import * as HKEPC from '../../data/config/hkepc'
import swal from 'sweetalert2'

const cheerio = require('cheerio')

export class UserProfileController {
  static get STATE () {
    return 'tab.user-profile'
  }

  static get NAME () {
    return 'UserProfileController'
  }

  static get CONFIG () {
    return {
      url: '/userProfile?author=',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/user-profile.html',
          controller: UserProfileController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $stateParams, $state, $ionicHistory, ngToast, apiService, $compile) {
    this.state = $state
    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.ngToast = ngToast
    this.apiService = apiService
    this.compile = $compile

    const author = JSON.parse($stateParams.author || '{}')

    this.author = author

    $scope.$on('$ionicView.loaded', (e) => {
      this.apiService.userProfile(author.uid).safeApply($scope, data => {
        this.content = data.content
      }).subscribe()
    })
  }

  async sendPm (author) {
    const { value: inputText } = await swal({
      title: `發訊息給 ${author.name}`,
      input: 'textarea',
      inputPlaceholder: '輸入你的訊息',
      confirmButtonText: '發送',
      cancelButtonText: '取消',
      reverseButtons: true,
      showCancelButton: true,
      customClass: 'message',
      focusConfirm: true
    })

    if (inputText === undefined) {
      // cancel case
      return
    }

    if (inputText === '') {
      // empty input
      this.ngToast.danger(`<i class="ion-alert-circled"> 不能發送空白訊息！</i>`)
      return
    }

    this.apiService.preSendPm(author.uid)
      .flatMap((resp) => {
        const xml = cheerio.load(resp.data, { xmlMode: true })
        const rawHtml = _.replace(
          _.replace(xml('root').html(), '<![CDATA[', '')
          , ']]>', '')
        const $ = cheerio.load(rawHtml)
        const relativeUrl = $('#sendpmform').attr('action')
        const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`
        const formSource = cheerio.load($('#sendpmform').html())

        const hiddenFormInputs = {}
        formSource(`input[type='hidden']`).map((i, elem) => {
          const k = formSource(elem).attr('name')
          const v = formSource(elem).attr('value')

          hiddenFormInputs[k] = encodeURIComponent(v)
        }).get()

        return this.apiService.dynamicRequest({
          method: 'POST',
          url: postUrl,
          data: {
            msgto: author.name,
            message: inputText,
            ...hiddenFormInputs
          },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      })
      .safeApply(this.scope, (resp) => {
        const responseText = cheerio.load(XMLUtils.removeCDATA(resp.data), { xmlMode: true }).html()
        const isSuccess = _.includes(responseText, '成功')
        if (isSuccess) {
          swal({
            animation: false,
            title: '發送成功',
            type: 'success',
            confirmButtonText: '確定'
          })
        } else {
          swal({
            animation: false,
            title: '發送失敗',
            text: `HKEPC 傳回:「${responseText}`,
            type: 'error',
            confirmButtonText: '確定'
          })
        }
      })
      .subscribe()
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }
}

import * as Controllers from './index'
import {XMLUtils} from "../../utils/xml";
import * as _ from "lodash";
import * as HKEPC from "../../data/config/hkepc";

const cheerio = require('cheerio')
const uuid = require('uuid-v4');

export class UserProfileController {
  static get STATE() { return 'tab.user-profile'}
  static get NAME() { return 'UserProfileController'}
  static get CONFIG() { return {
    url: '/userProfile?author=',
    cache: false,
    views: {
      'main': {
        templateUrl: 'templates/user-profile.html',
        controller: UserProfileController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, $stateParams, $state, $ionicHistory, ngToast, apiService, $compile) {
    this.state = $state
    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.ngToast = ngToast
    this.apiService = apiService
    this.compile = $compile

    const author = JSON.parse($stateParams.author || '{}')

    console.log("author", author)
    this.author = author

    this.apiService.userProfile(author.uid).safeApply($scope, data => {
      this.content = data.content
    }).subscribe()

  }

  sendPm(author){
    // FIXME: Not a good way. just a work arround
    const uid = uuid()
    swal({
      title: `發訊息給${author.name}`,
      content: {
        element: "textarea",
        attributes: {
          id: uid,
          rows: 5,
          autofocus: true,
          placeholder:"請輸入內容..."
        },
      },
      className: "message",
      buttons: ["取消", "發送"],
    })
      .then((value) => {
        if(value){
          const inputText = document.getElementById(uid).value
          if(!inputText){
            this.ngToast.danger(`<i class="ion-alert-circled"> 不能發送空白訊息！</i>`)
            return
          }

          swal({
            content: (() => {
              return this.compile(`
                          <div>
                              <ion-spinner class='image-loader' icon='android'/>
                              <div class="text-center">傳送到 HKEPC 伺服器中</div>
                          </div>
                        `)(this.scope)[0]
            })(),
            closeOnEsc: false,
            closeOnClickOutside: false,
            buttons: false
          })

          this.apiService.preSendPm(author.uid)
            .flatMap((resp) => {
              const xml = cheerio.load(resp.data,{xmlMode:true})
              const rawHtml = _.replace(
                _.replace(xml('root').html(), '<![CDATA[','',)
                ,']]>', '')
              const $ = cheerio.load(rawHtml)
              const relativeUrl = $('#sendpmform').attr('action')
              const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`
              let formSource = cheerio.load($('#sendpmform').html())

              const hiddenFormInputs = {}
              formSource(`input[type='hidden']`).map((i,elem) => {
                const k = formSource(elem).attr('name')
                const v = formSource(elem).attr('value')

                hiddenFormInputs[k] = encodeURIComponent(v)
              }).get()

              return this.apiService.dynamicRequest({
                method: "POST",
                url : postUrl,
                data : {
                  msgto: author.name,
                  message: inputText,
                  ...hiddenFormInputs,
                },
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              })
            })
            .safeApply(this.scope, (resp) => {
              const responseText = cheerio.load(XMLUtils.removeCDATA(resp.data),{xmlMode:true}).html()
              const isSuccess = _.includes(responseText, '成功')
              if(isSuccess){
                swal({
                  title: "發送成功",
                  icon: "success",
                  button: "確定",
                })
              }
              else {
                swal({
                  title: "發送失敗",
                  text: `HKEPC 傳回:「${responseText}`,
                  icon: "error",
                  button: "確定",
                })
              }
            })
            .subscribe()

        }

      });
  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
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
